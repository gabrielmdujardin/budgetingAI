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
    <section className="rounded-2xl border border-gray-100 bg-white p-6">
      <h2 className="text-base font-bold tracking-tight text-gray-900 mb-6">Receitas x Despesas</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="label" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="#94A3B8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$ ${Number(value) / 100}`}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ''}
              contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            />
            <Legend wrapperStyle={{ paddingTop: 16 }} />
            <Bar dataKey="receitas" name="Receitas" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="despesas" name="Despesas" fill="#F43F5E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
