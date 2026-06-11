import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/**
 * Issues by language chart.
 * @param {{issuesByLanguage: object}} props Component props.
 * @returns {JSX.Element}
 */
export default function LanguageChart({ issuesByLanguage }) {
  const data = Object.entries(issuesByLanguage || {}).map(([language, count]) => ({
    language,
    count
  }));

  return (
    <section className="surface rounded-xl p-5">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">Issues by language</h2>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="language" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
            />
            <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
