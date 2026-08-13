interface DashboardCardProps {
  title: string;
  value: string;
  tone?: 'default' | 'income' | 'expense' | 'warning';
}

const valueColor = {
  default: 'text-gray-900',
  income: 'text-emerald-600',
  expense: 'text-rose-600',
  warning: 'text-amber-600',
};

export function DashboardCard({ title, value, tone = 'default' }: DashboardCardProps) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:border-gray-200">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</p>
      <p className={`mt-3 text-3xl font-extrabold tracking-tight ${valueColor[tone]}`}>{value}</p>
    </article>
  );
}
