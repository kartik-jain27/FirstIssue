import { Code2, Database, GitPullRequestArrow, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchStats } from '../api/client.js';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import FilterSidebar from '../components/issues/FilterSidebar.jsx';
import IssueList from '../components/issues/IssueList.jsx';
import Pagination from '../components/issues/Pagination.jsx';
import SearchBar from '../components/issues/SearchBar.jsx';
import { useIssues } from '../hooks/useIssues.js';

/**
 * Main browse and filter experience.
 * @returns {JSX.Element}
 */
export default function HomePage() {
  const { issues, loading, error, pagination, filters, setFilter, toggleLabel, refetch } = useIssues();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats().then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.5fr_1fr] lg:p-8">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-200">
              <GitPullRequestArrow size={16} />
              Open-source contribution finder
            </div>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Find your next open-source contribution
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Browse beginner-friendly issues across active GitHub repositories, filtered by language,
              labels, project traction, and activity.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 self-end">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/70">
              <Database className="mb-3 text-indigo-600 dark:text-indigo-300" size={22} />
              <p className="text-2xl font-extrabold text-slate-950 dark:text-white">
                {Number(stats?.totalIssues || 0).toLocaleString()}
              </p>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Live issues</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/70">
              <Code2 className="mb-3 text-cyan-600 dark:text-cyan-300" size={22} />
              <p className="text-2xl font-extrabold text-slate-950 dark:text-white">
                {Number(stats?.totalRepos || 0).toLocaleString()}
              </p>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Repositories</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <FilterSidebar filters={filters} setFilter={setFilter} toggleLabel={toggleLabel} />
        <section className="min-w-0 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <SearchBar value={filters.search} onChange={(value) => setFilter('search', value)} />
            </div>
            <button
              type="button"
              onClick={refetch}
              className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-800"
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </div>

          {error && <ErrorBanner message={error} onRetry={refetch} />}
          <IssueList issues={issues} loading={loading} />
          <Pagination pagination={pagination} onPageChange={(page) => setFilter('page', page)} />
        </section>
      </div>
    </div>
  );
}
