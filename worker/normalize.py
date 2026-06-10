from datetime import datetime, timezone


def parse_github_timestamp(value):
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def compute_activity_score(updated_at, comments_count):
    """Score issues by freshness and low competition.

    Formula:
      activity_score = (0.7 * recency_component) + (0.3 * low_competition_component)

    recency_component is 1 / (days_since_update + 1), so an issue updated today
    receives 1.0 and older issues gradually approach 0. low_competition_component
    is 1 / (comments_count + 1), which favors issues with fewer existing comments.
    The final value is multiplied by 10 for easier sorting/readability.
    """
    now = datetime.now(timezone.utc)
    updated = updated_at or now

    if updated.tzinfo is None:
        updated = updated.replace(tzinfo=timezone.utc)

    days_since_update = max((now - updated).total_seconds() / 86400, 0)
    recency_component = 1 / (days_since_update + 1)
    low_competition_component = 1 / (comments_count + 1)

    return round(((0.7 * recency_component) + (0.3 * low_competition_component)) * 10, 4)


def normalize_issue(issue, repo_metadata, fallback_language):
    labels = [label["name"] for label in issue.get("labels", []) if label.get("name")]
    updated_at = parse_github_timestamp(issue.get("updated_at"))
    comments_count = issue.get("comments", 0)

    return {
        "github_id": issue["id"],
        "repo_name": repo_metadata["full_name"],
        "repo_url": repo_metadata["html_url"],
        "repo_stars": repo_metadata.get("stargazers_count", 0),
        "title": issue["title"],
        "issue_url": issue["html_url"],
        "language": repo_metadata.get("language") or fallback_language,
        "labels": labels,
        "comments_count": comments_count,
        "created_at": parse_github_timestamp(issue.get("created_at")),
        "updated_at": updated_at,
        "activity_score": compute_activity_score(updated_at, comments_count),
    }
