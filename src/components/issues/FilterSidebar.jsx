import { Check, ChevronDown, Filter, SlidersHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const languages = ['', 'JavaScript', 'Python', 'TypeScript', 'Go', 'Rust', 'Java', 'C++'];
const labels = ['good first issue', 'help wanted', 'bug', 'documentation'];
const sorts = [
  { value: 'score', label: 'Activity Score' },
  { value: 'stars', label: 'Most Stars' },
  { value: 'recent', label: 'Recently Updated' }
];

function LanguageDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedLabel = value || 'All languages';

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="focus-ring flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-left text-sm font-semibold text-slate-900 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:hover:border-indigo-800 dark:hover:bg-indigo-950/30"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={17} className={`text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-12 z-30 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-800 dark:bg-slate-950">
          <div role="listbox" className="max-h-64 overflow-y-auto">
            {languages.map((language) => {
              const label = language || 'All languages';
              const selected = language === value;

              return (
                <button
                  key={language || 'all'}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(language);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                    selected
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{label}</span>
                  {selected && <Check size={16} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


/**
 * Responsive issue filter controls.
 * @param {{filters: object, setFilter: Function, toggleLabel: Function}} props Component props.
 * @returns {JSX.Element}
 */
export default function FilterSidebar({ filters, setFilter, toggleLabel }) {
  return (
    <aside className="surface rounded-xl p-4 lg:sticky lg:top-24">
      <details className="group" open>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 lg:cursor-default">
          <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <Filter size={16} />
            Filters
          </span>
          <ChevronDown className="transition group-open:rotate-180 lg:hidden" size={18} />
        </summary>

        <div className="mt-5 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Language</label>
            <LanguageDropdown value={filters.language} onChange={(language) => setFilter('language', language)} />
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Labels</p>
            <div className="space-y-2">
              {labels.map((label) => (
                <label
                  key={label}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-800 dark:text-slate-300 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/30"
                >
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={filters.labels.includes(label)}
                    onChange={() => toggleLabel(label)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Minimum stars</label>
              <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {Number(filters.minStars).toLocaleString()}+
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="250"
              value={filters.minStars}
              onChange={(event) => setFilter('minStars', Number(event.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <SlidersHorizontal size={16} />
              Sort by
            </label>
            <select
              value={filters.sortBy}
              onChange={(event) => setFilter('sortBy', event.target.value)}
              className="focus-ring h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              {sorts.map((sort) => (
                <option key={sort.value} value={sort.value}>
                  {sort.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </details>
    </aside>
  );
}
