import type { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  detail?: string;
  icon?: ReactNode;
  tone?: 'default' | 'income' | 'expense' | 'warning';
}

const toneClass = {
  default: 'text-[#009C3B] bg-[#009C3B]/10',
  income: 'text-[#0B8F3C] bg-[#0B8F3C]/10',
  expense: 'text-[#D93025] bg-[#D93025]/10',
  warning: 'text-[#8A6200] bg-[#F4B400]/20',
};

export function DashboardCard({ title, value, detail, icon, tone = 'default' }: DashboardCardProps) {
  return (
    <article className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-bold text-[#666666]">{title}</p>
        {icon && (
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${toneClass[tone]}`}>
            {icon}
          </div>
        )}
      </div>
      <p className="mt-3 text-2xl font-extrabold leading-tight text-[#222222]">{value}</p>
      {detail && <p className="mt-2 text-sm font-medium text-[#666666]">{detail}</p>}
    </article>
  );
}
