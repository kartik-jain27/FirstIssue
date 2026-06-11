import { ExternalLink, GitFork, Star } from 'lucide-react';

/**
 * Trending repositories ranked by issue count.
 * @param {{repos: Array<object>}} props Component props.
 * @returns {JSX.Element}
 */
export default function TrendingRepos({ repos }) {
  return (
    <section className="surface rounded-xl p-5">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">Trending repositories</h2>
      </div>
      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {repos.map((repo) => (
          <a
            key={repo.repoName}
            href={repo.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-between gap-4 py-4"
          >
            <div className="min-w-0">
              <p className="truncate font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-300">
                {repo.repoName}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <GitFork size={14} />
                  {repo.goodFirstIssueCount || repo.issueCount || 0} issues
                </span>
                <span className="inline-flex items-center gap-1">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  {Number(repo.repoStars || repo.stars || 0).toLocaleString()}
                </span>
              </div>
            </div>
            <ExternalLink className="shrink-0 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300" size={18} />
          </a>
        ))}
      </div>
    </section>
  );
}
