import { getTrendingRepos } from '../db/queries.js';

/**
 * Returns trending repositories by beginner-friendly issue count.
 * @returns {Promise<Array<object>>}
 */
export function listTrendingRepos() {
  return getTrendingRepos();
}
