import { Github, Server, ShieldCheck, Sparkles } from 'lucide-react';

const techStack = [
  'React',
  'Vite',
  'Tailwind CSS',
  'React Router',
  'Axios',
  'Recharts',
  'Express',
  'PostgreSQL',
  'Redis',
  'Python Worker'
];

/**
 * Project overview page.
 * @returns {JSX.Element}
 */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="surface rounded-xl p-6 sm:p-8">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-200">
          <Sparkles size={16} />
          Portfolio project
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          A focused discovery layer for first-time contributors
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
          This platform aggregates open GitHub issues labeled for beginners, stores normalized issue
          metadata, and exposes a fast search and analytics experience over the collected data.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <Github className="mb-3 text-indigo-600 dark:text-indigo-300" />
            <h2 className="font-bold text-slate-950 dark:text-white">GitHub API worker</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Fetches open issues, handles rate limits, and computes activity scores.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <Server className="mb-3 text-cyan-600 dark:text-cyan-300" />
            <h2 className="font-bold text-slate-950 dark:text-white">Express API</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Serves filterable issue data with PostgreSQL persistence and Redis caching.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <ShieldCheck className="mb-3 text-emerald-600 dark:text-emerald-300" />
            <h2 className="font-bold text-slate-950 dark:text-white">Recruiter-ready UI</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Presents search, filters, trend data, and issue cards in a polished interface.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-slate-950 dark:text-white">Tech stack</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {techStack.map((item) => (
              <span key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center text-sm font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
