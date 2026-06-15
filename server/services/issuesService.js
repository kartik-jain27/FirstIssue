import { getIssueById, listIssues } from '../db/queries.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Returns a paginated list of issues and pagination metadata.
 * @param {{language?: string, label?: string, minStars?: number, sortBy: 'score'|'stars'|'recent', page: number, limit: number}} filters
 * @returns {Promise<{data: Array<object>, pagination: object}>}
 */
export async function searchIssues(filters) {
  const { data, total } = await listIssues(filters);
  const totalPages = Math.ceil(total / filters.limit);

  return {
    data,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages
    }
  };
}

/**
 * Returns an issue by id or throws a 404.
 * @param {number} id Local issue id.
 * @returns {Promise<object>}
 */
export async function findIssue(id) {
  const issue = await getIssueById(id);

  if (!issue) {
    throw new AppError('Issue not found', 404, 'ISSUE_NOT_FOUND');
  }

  return issue;
}
