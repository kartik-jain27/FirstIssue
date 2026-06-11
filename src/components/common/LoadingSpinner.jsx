/**
 * Reusable loading indicator.
 * @param {{label?: string}} props Component props.
 * @returns {JSX.Element}
 */
export default function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-sm font-medium text-slate-500 dark:text-slate-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
      <span>{label}</span>
    </div>
  );
}
