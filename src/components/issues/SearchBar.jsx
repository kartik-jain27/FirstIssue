import { Search } from 'lucide-react';

/**
 * Search input for issue title, repo, and labels.
 * @param {{value: string, onChange: Function}} props Component props.
 * @returns {JSX.Element}
 */
export default function SearchBar({ value, onChange }) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search issues, repositories, labels"
        className="focus-ring h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium text-slate-900 shadow-sm transition placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
      />
    </label>
  );
}
