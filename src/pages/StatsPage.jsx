import { Clock3, Database, Languages, Rows3 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { fetchStats, fetchTrendingRepos } from '../api/client.js';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import LanguageChart from '../components/stats/LanguageChart.jsx';
import StatsCard from '../components/stats/StatsCard.jsx';
import TrendingRepos from '../components/stats/TrendingRepos.jsx';

function relativeDate(value) {
  if (!value) return 'Unknown';
  const diffDays = Math.max(Math.floor((Date.now() - new Date(value).getTime()) / 86400000), 0);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

/**
 * Analytics dashboard for issue inventory.
 * @returns {JSX.Element}
 */
export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const popularLanguage = useMemo(() => {
    const entries = Object.entries(stats?.issuesByLanguage || {});
    return entries.sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
  }, [stats]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [statsResult, reposResult] = await Promise.all([fetchStats(), fetchTrendingRepos()]);
      setStats(statsResult);
      setRepos(reposResult);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Platform stats</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Current coverage across repositories, languages, labels, and issue activity.
        </p>
      </div>

      {error && <ErrorBanner message={error} onRetry={loadData} />}
      {loading ? (
        <LoadingSpinner label="Loading stats" />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard label="Total Issues" value={Number(stats?.totalIssues || 0).toLocaleString()} tone="indigo" icon={<Database size={22} />} />
            <StatsCard label="Total Repos" value={Number(stats?.totalRepos || 0).toLocaleString()} tone="cyan" icon={<Rows3 size={22} />} />
            <StatsCard label="Last Updated" value={relativeDate(stats?.lastUpdated)} tone="emerald" icon={<Clock3 size={22} />} />
            <StatsCard label="Popular Language" value={popularLanguage} tone="amber" icon={<Languages size={22} />} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <LanguageChart issuesByLanguage={stats?.issuesByLanguage || {}} />
            <TrendingRepos repos={repos} />
          </div>

          <section className="surface rounded-xl p-5">
            <h2 className="mb-4 text-lg font-bold text-slate-950 dark:text-white">Top labels</h2>
            <div className="flex flex-wrap gap-2">
              {(stats?.topLabels || []).map((item) => (
                <span key={item.label} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {item.label} - {item.count}
                </span>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
