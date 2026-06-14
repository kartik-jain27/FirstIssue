import { getStats } from '../db/queries.js';

/**
 * Returns aggregate platform statistics.
 * @returns {Promise<object>}
 */
export async function readStats() {
  return getStats();
}
