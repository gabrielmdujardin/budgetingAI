'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { transactionService } from '@/services/transactionService';
import { CATEGORY_LABELS } from '@/types/transaction';
import { formatCurrency, formatShortDate } from '@/utils/formatters';

export default function SummaryPage() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['summary'],
    queryFn: () => transactionService.getSummary(),
  });

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionService.getTransactions(),
  });

  const categoryData = useMemo(() => {
    if (!summary?.categories) return [];

    return Object.entries(summary.categories)
      .filter(([, amount]) => amount > 0)
      .map(([category, amount]) => ({
        category,
        name: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]?.label ?? category,
        value: amount,
        color: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]?.color ?? '#6B7280',
      }))
      .sort((a, b) => b.value - a.value);
  }, [summary]);

  const dailyData = useMemo(() => {
    if (!transactions.length) return [];

    const grouped = transactions.reduce<Record<string, number>>((acc, transaction) => {
      const key = transaction.createdAt.slice(0, 10);
      acc[key] = (acc[key] ?? 0) + transaction.amount;
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-10)
      .map(([date, amount]) => ({
        date,
        label: formatShortDate(date),
        amount,
      }));
  }, [transactions]);

  const total = summary?.totalExpenses ?? 0;
  const isLoading = loadingSummary || loadingTransactions;

  return (
    <div className="space-y-6">
      {/* Header — Clean single title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-text">Relatórios</h1>
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Total: <strong className="text-text font-extrabold">{formatCurrency(total)}</strong>
        </span>
      </div>

      {isLoading ? (
        <LoadingState label="Carregando relatórios..." />
      ) : !categoryData.length ? (
        <EmptyState
          title="Nenhum dado disponível"
          description="Cadastre transações para visualizar os relatórios."
        />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl">
              <h2 className="text-base font-bold tracking-tight text-text mb-6">Gastos por Categoria</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                    >
                      {categoryData.map((entry) => (
                        <Cell key={entry.category} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{ background: '#0B2A22', border: '1px solid rgba(80,180,140,0.15)', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.5)', color: '#F3F4F6' }}
                      itemStyle={{ color: '#F3F4F6' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl">
              <h2 className="text-base font-bold tracking-tight text-text mb-6">Volume por Período</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid stroke="var(--border, rgba(80,180,140,0.15))" vertical={false} />
                    <XAxis dataKey="label" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${Number(value) / 100}`} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ''}
                      contentStyle={{ background: '#0B2A22', border: '1px solid rgba(80,180,140,0.15)', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.5)', color: '#F3F4F6' }}
                      itemStyle={{ color: '#F3F4F6' }}
                    />
                    <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl">
            <h2 className="text-base font-bold tracking-tight text-text mb-6">Distribuição de Gastos</h2>
            <div className="space-y-4">
              {categoryData.map((item) => {
                const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;

                return (
                  <div key={item.category} className="border-b border-border pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 font-semibold text-text">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-text">{formatCurrency(item.value)}</span>
                        <span className="ml-2 text-xs font-semibold text-text-secondary">({percent}%)</span>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-surface-hover">
                      <div className="h-1.5 rounded-full" style={{ width: `${percent}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
