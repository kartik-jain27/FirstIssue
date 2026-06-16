import { query } from './pool.js';

const SORT_COLUMNS = {
  score: 'activity_score DESC, updated_at DESC',
  stars: 'repo_stars DESC, activity_score DESC',
  recent: 'updated_at DESC, activity_score DESC'
};

function buildIssueFilters(filters) {
  const clauses = [];
  const values = [];

  if (filters.language) {
    values.push(filters.language);
    clauses.push(`LOWER(language) = LOWER($${values.length})`);
  }

  if (filters.label) {
    values.push(filters.label);
    clauses.push(`EXISTS (SELECT 1 FROM unnest(labels) AS label WHERE LOWER(label) = LOWER($${values.length}))`);
  }

  if (filters.minStars !== undefined) {
    values.push(filters.minStars);
    clauses.push(`repo_stars >= $${values.length}`);
  }

  return {
    where: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    values
  };
}

/**
 * Fetches filtered issues with pagination.
 * @param {{language?: string, label?: string, minStars?: number, sortBy: 'score'|'stars'|'recent', page: number, limit: number}} filters
 * @returns {Promise<{data: Array<object>, total: number}>}
 */
export async function listIssues(filters) {
  const { where, values } = buildIssueFilters(filters);
  const countResult = await query(`SELECT COUNT(*)::int AS total FROM issues ${where}`, values);

  const offset = (filters.page - 1) * filters.limit;
  const listValues = [...values, filters.limit, offset];
  const limitParam = listValues.length - 1;
  const offsetParam = listValues.length;
  const sortClause = SORT_COLUMNS[filters.sortBy];

  const result = await query(
    `
      SELECT
        id,
        github_id AS "githubId",
        repo_name AS "repoName",
        repo_url AS "repoUrl",
        repo_stars AS "repoStars",
        title,
        issue_url AS "issueUrl",
        language,
        ARRAY(SELECT LOWER(label) FROM unnest(labels) AS label) AS labels,
        comments_count AS "commentsCount",
        created_at AS "createdAt",
        updated_at AS "updatedAt",
        activity_score AS "activityScore",
        fetched_at AS "fetchedAt"
      FROM issues
      ${where}
      ORDER BY ${sortClause}
      LIMIT $${limitParam}
      OFFSET $${offsetParam}
    `,
    listValues
  );

  return {
    data: result.rows,
    total: countResult.rows[0].total
  };
}

/**
 * Fetches one issue by local database id.
 * @param {number} id Local issue id.
 * @returns {Promise<object | null>}
 */
export async function getIssueById(id) {
  const result = await query(
    `
      SELECT
        id,
        github_id AS "githubId",
        repo_name AS "repoName",
        repo_url AS "repoUrl",
        repo_stars AS "repoStars",
        title,
        issue_url AS "issueUrl",
        language,
        ARRAY(SELECT LOWER(label) FROM unnest(labels) AS label) AS labels,
        comments_count AS "commentsCount",
        created_at AS "createdAt",
        updated_at AS "updatedAt",
        activity_score AS "activityScore",
        fetched_at AS "fetchedAt"
      FROM issues
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] ?? null;
}

/**
 * Returns repositories ranked by open beginner-friendly issue count.
 * @returns {Promise<Array<object>>}
 */
export async function getTrendingRepos() {
  const result = await query(`
    SELECT
      repo_name AS "repoName",
      repo_url AS "repoUrl",
      MAX(repo_stars) AS "repoStars",
      COUNT(*)::int AS "goodFirstIssueCount",
      MAX(fetched_at) AS "lastFetchedAt"
    FROM issues
    GROUP BY repo_name, repo_url
    ORDER BY COUNT(*) DESC, MAX(repo_stars) DESC
    LIMIT 10
  `);

  return result.rows;
}

/**
 * Returns aggregate platform statistics.
 * @returns {Promise<object>}
 */
export async function getStats() {
  const [summary, byLanguage, labels] = await Promise.all([
    query(`
      SELECT
        COUNT(*)::int AS "totalIssues",
        COUNT(DISTINCT repo_name)::int AS "totalRepos",
        MAX(fetched_at) AS "lastUpdated"
      FROM issues
    `),
    query(`
      SELECT COALESCE(language, 'Unknown') AS language, COUNT(*)::int AS count
      FROM issues
      GROUP BY COALESCE(language, 'Unknown')
      ORDER BY count DESC, language ASC
    `),
    query(`
      SELECT LOWER(label) AS label, COUNT(*)::int AS count
      FROM issues, unnest(labels) AS label
      GROUP BY LOWER(label)
      ORDER BY count DESC, label ASC
      LIMIT 10
    `)
  ]);

  return {
    totalIssues: summary.rows[0].totalIssues,
    issuesByLanguage: Object.fromEntries(byLanguage.rows.map((row) => [row.language, row.count])),
    totalRepos: summary.rows[0].totalRepos,
    lastUpdated: summary.rows[0].lastUpdated,
    topLabels: labels.rows
  };
}
