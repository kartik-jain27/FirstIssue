const BOOKMARKS_KEY = 'bookmarkedIssues';
export const BOOKMARKS_CHANGED_EVENT = 'bookmarks:changed';

function getIssueKey(issue) {
  return String(issue?.githubId ?? issue?.id ?? '');
}

function notifyBookmarkChange() {
  window.dispatchEvent(new CustomEvent(BOOKMARKS_CHANGED_EVENT));
}

/**
 * Reads bookmarked issue objects from localStorage.
 * @returns {Array<object>}
 */
export function getBookmarkedIssues() {
  try {
    const parsed = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Returns the number of saved bookmarks.
 * @returns {number}
 */
export function getBookmarkCount() {
  return getBookmarkedIssues().length;
}

/**
 * Checks whether an issue is currently bookmarked.
 * @param {object} issue Issue object.
 * @returns {boolean}
 */
export function isIssueBookmarked(issue) {
  const key = getIssueKey(issue);
  return Boolean(key) && getBookmarkedIssues().some((item) => getIssueKey(item) === key);
}

/**
 * Adds or removes an issue from localStorage bookmarks.
 * @param {object} issue Issue object to toggle.
 * @returns {boolean} True when the issue is now bookmarked.
 */
export function toggleBookmarkedIssue(issue) {
  const key = getIssueKey(issue);
  if (!key) return false;

  const current = getBookmarkedIssues();
  const exists = current.some((item) => getIssueKey(item) === key);
  const next = exists ? current.filter((item) => getIssueKey(item) !== key) : [issue, ...current];

  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
  notifyBookmarkChange();
  return !exists;
}
