import { SearchX } from 'lucide-react';

/**
 * Empty results state.
 * @param {{title?: string, message?: string}} props Component props.
 * @returns {JSX.Element}
 */
export default function EmptyState({
  title = 'No issues found',
  message = 'Try widening the filters or clearing the search text.'
}) {
  return (
    <div className="surface flex flex-col items-center justify-center rounded-xl px-6 py-16 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
        <SearchX size={28} />
      </div>
      <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}
