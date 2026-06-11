/**
 * Compact footer for the app shell.
 * @returns {JSX.Element}
 */
export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 sm:px-6 lg:px-8">
        <p className="font-medium text-slate-700 dark:text-slate-200">GitHub Good First Issue Aggregator</p>
        <p>Built with React, Express, PostgreSQL, Redis, and a GitHub API worker.</p>
      </div>
    </footer>
  );
}
