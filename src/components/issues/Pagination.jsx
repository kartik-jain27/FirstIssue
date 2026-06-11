import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination controls for issue pages.
 * @param {{pagination: object, onPageChange: Function}} props Component props.
 * @returns {JSX.Element}
 */
export default function Pagination({ pagination, onPageChange }) {
  const currentPage = pagination.page || 1;
  const totalPages = pagination.totalPages || 1;

  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        Page {currentPage} of {totalPages} - {Number(pagination.total || 0).toLocaleString()} issues
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-200 dark:hover:border-indigo-800"
        >
          <ChevronLeft size={16} />
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="focus-ring inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
