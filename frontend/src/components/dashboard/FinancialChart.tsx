'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Transaction } from '@/types/transaction';
import { formatCurrency, formatShortDate } from '@/utils/formatters';
import { isIncomeCategory } from '@/utils/finance';

export function FinancialChart({ transactions }: { transactions: Transaction[] }) {
  const data = Object.values(
    transactions.reduce<Record<string, { date: string; label: string; receitas: number; despesas: number }>>(
      (acc, transaction) => {
        const date = transaction.createdAt.slice(0, 10);
        acc[date] ??= { date, label: formatShortDate(date), receitas: 0, despesas: 0 };

        if (isIncomeCategory(transaction.category)) {
          acc[date].receitas += transaction.amount;
        } else {
          acc[date].despesas += transaction.amount;
        }

        return acc;
      },
      {}
    )
  )
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-8);

  return (
    <section className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-lg font-extrabold text-[#222222]">Receitas x Despesas</h2>
          <p className="text-sm text-[#666666]">Ultimos lancamentos por periodo</p>
        </div>
        <span className="text-xs font-bold uppercase text-[#666666]">Periodo recente</span>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#E5E5E5" vertical={false} />
            <XAxis dataKey="label" stroke="#666666" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#666666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$ ${Number(value) / 100}`}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ''}
              contentStyle={{ background: '#FFFFFF', border: '1px solid #DADADA', borderRadius: 6, color: '#222222' }}
            />
            <Legend />
            <Bar dataKey="receitas" name="Receitas" fill="#0B8F3C" radius={[4, 4, 0, 0]} />
            <Bar dataKey="despesas" name="Despesas" fill="#D93025" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
