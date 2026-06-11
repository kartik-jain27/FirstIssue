import { Bookmark, ExternalLink, MessageCircle, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const languageColors = {
  JavaScript: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200',
  TypeScript: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200',
  Python: 'bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-200',
  Go: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-200',
  Rust: 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-200',
  Java: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200',
  'C++': 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950/50 dark:text-fuchsia-200'
};

const labelColors = {
  'good first issue': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200',
  'help wanted': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200',
  bug: 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200',
  documentation: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  docs: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  test: 'bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-200'
};

const scoreWidths = [
  'w-0',
  'w-[10%]',
  'w-[20%]',
  'w-[30%]',
  'w-[40%]',
  'w-[50%]',
  'w-[60%]',
  'w-[70%]',
  'w-[80%]',
  'w-[90%]',
  'w-full'
];

function getRelativeDays(value) {
  if (!value) return 'recently';
  const date = new Date(value);
  const diffDays = Math.max(Math.floor((Date.now() - date.getTime()) / 86400000), 0);
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

/**
 * Issue summary card using camelCase backend fields.
 * @param {{issue: object}} props Component props.
 * @returns {JSX.Element}
 */
export default function IssueCard({ issue }) {
  const bookmarkKey = `bookmarked-issue-${issue.githubId}`;
  const [bookmarked, setBookmarked] = useState(() => localStorage.getItem(bookmarkKey) === 'true');
  const scoreBucket = useMemo(() => Math.min(Math.max(Math.round(issue.activityScore || 0), 0), 10), [issue.activityScore]);
  const issueLabels = issue.labels || [];

  useEffect(() => {
    localStorage.setItem(bookmarkKey, bookmarked ? 'true' : 'false');
  }, [bookmarkKey, bookmarked]);

  return (
    <article className="surface flex h-full flex-col rounded-xl p-5 transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl dark:hover:border-indigo-800">
      <div className="flex items-start justify-between gap-3">
        <a
          href={issue.repoUrl}
          target="_blank"
          rel="noreferrer"
          className="min-w-0 text-sm font-bold text-slate-700 transition hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-300"
        >
          <span className="block truncate">{issue.repoName}</span>
        </a>
        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            {Number(issue.repoStars || 0).toLocaleString()}
          </span>
          <button
            type="button"
            onClick={() => setBookmarked((value) => !value)}
            className="focus-ring rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-300"
            aria-label="Bookmark issue"
            title="Bookmark issue"
          >
            <Bookmark size={18} className={bookmarked ? 'fill-indigo-600 text-indigo-600' : ''} />
          </button>
        </div>
      </div>

      <a
        href={issue.issueUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-4 line-clamp-3 text-base font-bold leading-6 text-slate-950 transition hover:text-indigo-600 dark:text-white dark:hover:text-indigo-300"
      >
        {issue.title}
        <ExternalLink className="ml-1 inline-block align-text-bottom" size={15} />
      </a>

      <div className="mt-4 flex flex-wrap gap-2">
        {issue.language && (
          <span className={`rounded-lg px-2 py-1 text-xs font-bold ${languageColors[issue.language] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>
            {issue.language}
          </span>
        )}
        {issueLabels.slice(0, 4).map((label) => (
          <span
            key={label}
            className={`rounded-lg px-2 py-1 text-xs font-semibold ${labelColors[label] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-5">
        <div className="mb-3 flex items-center justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <MessageCircle size={15} />
            {issue.commentsCount || 0}
          </span>
          <span>Updated {getRelativeDays(issue.updatedAt)}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className={`h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 ${scoreWidths[scoreBucket]}`} />
          </div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {(issue.activityScore || 0).toFixed(1)}
          </span>
        </div>
      </div>
    </article>
  );
}
