import { listIssues, getIssueById } from '../db/queries.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Returns a paginated, filtered list of issues.
 * @param {{language?: string, label?: string, minStars?: number, sortBy: 'score'|'stars'|'recent', page: number, limit: number}} filters
 * @returns {Promise<{data: Array<object>, total: number}>}
 */
export async function searchIssues(filters) {
  return listIssues(filters);
}

/**
 * Returns a single issue by id, or throws a 404 AppError if not found.
 * @param {number} id Local issue id.
 * @returns {Promise<object>}
 */
export async function findIssue(id) {
  const issue = await getIssueById(id);

  if (!issue) {
    throw new AppError(`Issue ${id} not found`, 404, 'NOT_FOUND');
  }

  return issue;
}
