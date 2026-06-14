import logging
import time
from datetime import datetime, timezone

import psycopg
import requests

from config import (
    DATABASE_URL,
    GITHUB_API_BASE,
    GITHUB_TOKEN,
    REQUEST_TIMEOUT_SECONDS,
    SEARCH_PER_PAGE,
    TARGET_LABELS,
    TARGET_REPOSITORIES,
)
from normalize import normalize_issue

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


def build_session():
    session = requests.Session()
    session.headers.update(
        {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "good-first-issue-aggregator",
        }
    )

    if GITHUB_TOKEN:
        session.headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"

    return session


def respect_rate_limit(response):
    remaining = response.headers.get("X-RateLimit-Remaining")
    reset_at = response.headers.get("X-RateLimit-Reset")

    if remaining == "0" and reset_at:
        sleep_for = max(int(reset_at) - int(time.time()) + 5, 1)
        reset_time = datetime.fromtimestamp(int(reset_at), tz=timezone.utc).isoformat()
        logger.warning("GitHub rate limit reached. Sleeping until %s (%ss).", reset_time, sleep_for)
        time.sleep(sleep_for)


def github_get(session, path, params=None):
    url = f"{GITHUB_API_BASE}{path}"

    while True:
        response = session.get(url, params=params, timeout=REQUEST_TIMEOUT_SECONDS)
        respect_rate_limit(response)

        if response.status_code == 403 and response.headers.get("X-RateLimit-Remaining") == "0":
            continue

        response.raise_for_status()
        return response.json()


def fetch_repo_metadata(session, owner, repo):
    return github_get(session, f"/repos/{owner}/{repo}")


def fetch_search_results(session, owner, repo, label):
    # Matches the requested GitHub Search API shape:
    # repo:{owner}/{repo}+label:"good first issue"+state:open
    query = f'repo:{owner}/{repo} label:"{label}" state:open type:issue'
    page = 1

    while True:
        try:
            payload = github_get(
                session,
                "/search/issues",
                params={
                    "q": query,
                    "sort": "updated",
                    "order": "desc",
                    "per_page": SEARCH_PER_PAGE,
                    "page": page,
                },
            )
        except requests.HTTPError as error:
            status_code = error.response.status_code if error.response is not None else None
            if status_code == 422:
                logger.warning("Skipping %s/%s label %r because GitHub rejected the search query.", owner, repo, label)
                return
            raise

        items = payload.get("items", [])
        for issue in items:
            if "pull_request" not in issue:
                yield issue

        if len(items) < SEARCH_PER_PAGE or page >= 10:
            break

        page += 1


def upsert_issues(connection, issues):
    if not issues:
        return 0

    sql = """
        INSERT INTO issues (
          github_id,
          repo_name,
          repo_url,
          repo_stars,
          title,
          issue_url,
          language,
          labels,
          comments_count,
          created_at,
          updated_at,
          activity_score,
          fetched_at
        ) VALUES (
          %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
        ON CONFLICT (github_id) DO UPDATE SET
          repo_name = EXCLUDED.repo_name,
          repo_url = EXCLUDED.repo_url,
          repo_stars = EXCLUDED.repo_stars,
          title = EXCLUDED.title,
          issue_url = EXCLUDED.issue_url,
          language = EXCLUDED.language,
          labels = EXCLUDED.labels,
          comments_count = EXCLUDED.comments_count,
          created_at = EXCLUDED.created_at,
          updated_at = EXCLUDED.updated_at,
          activity_score = EXCLUDED.activity_score,
          fetched_at = now()
    """

    values = [
        (
            issue["github_id"],
            issue["repo_name"],
            issue["repo_url"],
            issue["repo_stars"],
            issue["title"],
            issue["issue_url"],
            issue["language"],
            issue["labels"],
            issue["comments_count"],
            issue["created_at"],
            issue["updated_at"],
            issue["activity_score"],
            datetime.now(timezone.utc),
        )
        for issue in issues
    ]

    with connection.cursor() as cursor:
        cursor.executemany(sql, values)

    connection.commit()
    return len(issues)


def fetch_and_store_issues():
    session = build_session()
    total_upserted = 0

    with psycopg.connect(DATABASE_URL) as connection:
        for target in TARGET_REPOSITORIES:
            owner = target["owner"]
            repo = target["repo"]
            fallback_language = target["language"]
            logger.info("Fetching repository metadata for %s/%s", owner, repo)
            repo_metadata = fetch_repo_metadata(session, owner, repo)

            deduped = {}
            for label in TARGET_LABELS:
                logger.info("Searching %s/%s for label %r", owner, repo, label)
                for issue in fetch_search_results(session, owner, repo, label):
                    normalized = normalize_issue(issue, repo_metadata, fallback_language)
                    deduped[normalized["github_id"]] = normalized

            upserted = upsert_issues(connection, list(deduped.values()))
            total_upserted += upserted
            logger.info("Upserted %s issues for %s/%s", upserted, owner, repo)

    logger.info("Worker finished. Upserted %s issues total.", total_upserted)
    return total_upserted


if __name__ == "__main__":
    fetch_and_store_issues()
