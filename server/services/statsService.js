import { getStats } from '../db/queries.js';

/**
 * Returns aggregate issue and repository statistics.
 * @returns {Promise<object>}
 */
export function readStats() {
  return getStats();
}
