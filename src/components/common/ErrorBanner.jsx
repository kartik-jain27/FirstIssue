import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Friendly API error banner with retry action.
 * @param {{message: string, onRetry?: Function}} props Component props.
 * @returns {JSX.Element}
 */
export default function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-100 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 shrink-0" size={20} />
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      )}
    </div>
  );
}
