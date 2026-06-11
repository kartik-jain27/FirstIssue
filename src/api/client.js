import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 12000
});

function toFriendlyError(error, fallback) {
  return error?.response?.data?.error?.message || error?.message || fallback;
}

/**
 * Fetches issues using the backend's camelCase response contract.
 * @param {object} params Query parameters.
 * @returns {Promise<{data: Array<object>, pagination: object}>}
 */
export async function fetchIssues(params) {
  try {
    const response = await apiClient.get('/issues', { params });
    return response.data;
  } catch (error) {
    throw new Error(toFriendlyError(error, 'Unable to load issues.'));
  }
}

/**
 * Fetches one issue by id.
 * @param {number|string} id Issue id.
 * @returns {Promise<object>}
 */
export async function fetchIssueById(id) {
  try {
    const response = await apiClient.get(`/issues/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(toFriendlyError(error, 'Unable to load issue.'));
  }
}

/**
 * Fetches top repositories and unwraps the backend's { data } response.
 * @returns {Promise<Array<object>>}
 */
export async function fetchTrendingRepos() {
  try {
    const response = await apiClient.get('/repos/trending');
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  } catch (error) {
    throw new Error(toFriendlyError(error, 'Unable to load trending repositories.'));
  }
}

/**
 * Fetches aggregate platform stats.
 * @returns {Promise<object>}
 */
export async function fetchStats() {
  try {
    const response = await apiClient.get('/stats');
    return response.data;
  } catch (error) {
    throw new Error(toFriendlyError(error, 'Unable to load platform stats.'));
  }
}
