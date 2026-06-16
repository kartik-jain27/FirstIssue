import { Bookmark, Github, Moon, SearchCode, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BOOKMARKS_CHANGED_EVENT, getBookmarkCount } from '../../utils/bookmarks.js';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/stats', label: 'Stats' },
  { to: '/about', label: 'About' },
  { to: '/bookmarks', label: 'Bookmarks' }
];

/**
 * Top navigation with dark mode persistence.
 * @returns {JSX.Element}
 */
export default function Navbar() {
  const themeTimer = useRef(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [bookmarkCount, setBookmarkCount] = useState(() => getBookmarkCount());

  useEffect(() => {
    function syncBookmarkCount() {
      setBookmarkCount(getBookmarkCount());
    }

    window.addEventListener(BOOKMARKS_CHANGED_EVENT, syncBookmarkCount);
    window.addEventListener('storage', syncBookmarkCount);
    return () => {
      window.removeEventListener(BOOKMARKS_CHANGED_EVENT, syncBookmarkCount);
      window.removeEventListener('storage', syncBookmarkCount);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    return () => {
      if (themeTimer.current) {
        window.clearTimeout(themeTimer.current);
      }
    };
  }, []);

  function handleThemeToggle() {
    if (themeTimer.current) {
      window.clearTimeout(themeTimer.current);
    }

    document.body.classList.add('theme-flicker');
    themeTimer.current = window.setTimeout(() => {
      document.body.classList.remove('theme-flicker');
      setDarkMode((value) => !value);
      themeTimer.current = null;
    }, 400);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
            <SearchCode size={22} />
          </span>
          <span className="truncate text-base font-bold tracking-tight sm:text-lg">Good First Issues</span>
        </NavLink>

        <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300'
                    : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
                }`
              }
            >
              <span className="inline-flex items-center gap-2">
                {link.to === '/bookmarks' && <Bookmark size={15} />}
                {link.label}
                {link.to === '/bookmarks' && bookmarkCount > 0 && (
                  <span className="min-w-5 rounded-full bg-indigo-600 px-1.5 py-0.5 text-center text-[11px] font-extrabold text-white dark:bg-indigo-400 dark:text-slate-950">
                    {bookmarkCount}
                  </span>
                )}
              </span>
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/kartik-jain27/FirstIssue"
            target="_blank"
            rel="noreferrer"
            className="focus-ring hidden rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-800 dark:text-slate-300 dark:hover:border-indigo-800 dark:hover:text-indigo-300 sm:inline-flex"
            aria-label="Open project on GitHub"
            title="Open project on GitHub"
          >
            <Github size={20} />
          </a>
          <button
            type="button"
            onClick={handleThemeToggle}
            className="focus-ring rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-800 dark:text-slate-300 dark:hover:border-indigo-800 dark:hover:text-indigo-300"
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>

      <div className="mx-auto flex max-w-7xl gap-1 px-4 pb-3 sm:px-6 md:hidden">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex-1 rounded-xl px-3 py-2 text-center text-sm font-medium transition ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300'
              }`
            }
          >
            <span className="inline-flex items-center justify-center gap-1.5">
              {link.to === '/bookmarks' && <Bookmark size={14} />}
              {link.label}
              {link.to === '/bookmarks' && bookmarkCount > 0 && (
                <span className="min-w-5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-extrabold">{bookmarkCount}</span>
              )}
            </span>
          </NavLink>
        ))}
      </div>
    </header>
  );
}
