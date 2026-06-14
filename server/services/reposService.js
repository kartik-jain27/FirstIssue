import { getTrendingRepos } from '../db/queries.js';

/**
 * Returns repositories ranked by open beginner-friendly issue count.
 * @returns {Promise<Array<object>>}
 */
export async function listTrendingRepos() {
  return getTrendingRepos();
}
