interface DashboardCardProps {
  title: string;
  value: string;
  tone?: 'default' | 'income' | 'expense' | 'warning';
}

const valueColor = {
  default: 'text-text',
  income: 'text-primary',
  expense: 'text-rose-500',
  warning: 'text-amber-500',
};

export function DashboardCard({ title, value, tone = 'default' }: DashboardCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl transition-all hover:bg-white/10">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{title}</p>
      <p className={`mt-3 text-3xl font-extrabold tracking-tight ${valueColor[tone]}`}>{value}</p>
    </article>
  );
}
