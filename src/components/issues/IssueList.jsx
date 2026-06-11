import EmptyState from '../common/EmptyState.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import IssueCard from './IssueCard.jsx';

function SkeletonCard() {
  return (
    <div className="surface h-72 animate-pulse rounded-xl p-5">
      <div className="mb-5 h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mb-3 h-5 w-full rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mb-8 h-5 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="flex gap-2">
        <div className="h-7 w-20 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-7 w-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="mt-20 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

/**
 * Responsive issue grid with loading and empty states.
 * @param {{issues: Array<object>, loading: boolean}} props Component props.
 * @returns {JSX.Element}
 */
export default function IssueList({ issues, loading }) {
  if (loading && issues.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (!loading && issues.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      {loading && <LoadingSpinner label="Refreshing issues" />}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {issues.map((issue) => (
          <IssueCard key={issue.githubId || issue.id} issue={issue} />
        ))}
      </div>
    </>
  );
}
