import { Bookmark, Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import IssueCard from '../components/issues/IssueCard.jsx';
import { BOOKMARKS_CHANGED_EVENT, getBookmarkedIssues } from '../utils/bookmarks.js';

/**
 * Displays issues saved locally by the user.
 * @returns {JSX.Element}
 */
export default function BookmarksPage() {
  const [bookmarkedIssues, setBookmarkedIssues] = useState(() => getBookmarkedIssues());

  useEffect(() => {
    function syncBookmarks() {
      setBookmarkedIssues(getBookmarkedIssues());
    }

    window.addEventListener(BOOKMARKS_CHANGED_EVENT, syncBookmarks);
    window.addEventListener('storage', syncBookmarks);
    return () => {
      window.removeEventListener(BOOKMARKS_CHANGED_EVENT, syncBookmarks);
      window.removeEventListener('storage', syncBookmarks);
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-200">
            <Bookmark size={16} />
            Saved locally
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Bookmarks</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Issues you marked for later from this browser.</p>
        </div>
        <Link
          to="/"
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          <Home size={17} />
          Browse issues
        </Link>
      </div>

      {bookmarkedIssues.length === 0 ? (
        <section className="surface flex flex-col items-center justify-center rounded-xl px-6 py-16 text-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <Bookmark size={28} />
          </div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">No bookmarks yet</h2>
          <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">Save interesting issues from the home page and they will appear here.</p>
          <Link to="/" className="mt-5 text-sm font-bold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-300">
            Go back to Home
          </Link>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {bookmarkedIssues.map((issue) => (
            <IssueCard key={issue.githubId || issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}
