/**
 * Small KPI card.
 * @param {{label: string, value: string|number, tone?: string, icon?: JSX.Element}} props Component props.
 * @returns {JSX.Element}
 */
export default function StatsCard({ label, value, tone = 'indigo', icon }) {
  const tones = {
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-200',
    cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-200',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-200'
  };

  return (
    <div className="surface rounded-xl p-5">
      <div className={`mb-5 grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}>
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
