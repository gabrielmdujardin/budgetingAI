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
import { BarChart3, PieChart as PieChartIcon, Tags } from 'lucide-react';
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
        color: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]?.color ?? '#666666',
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

  const total = summary?.total ?? 0;
  const isLoading = loadingSummary || loadingTransactions;

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#222222]">Relatorios</h1>
          <p className="mt-1 text-base font-medium text-[#666666]">Graficos e distribuicao dos lancamentos</p>
        </div>
        <div className="rounded-md border border-neutral-200 bg-white px-4 py-3 text-right shadow-sm">
          <p className="text-xs font-bold uppercase text-[#666666]">Total no periodo</p>
          <p className="text-2xl font-extrabold text-[#D93025]">{formatCurrency(total)}</p>
        </div>
      </section>

      {isLoading ? (
        <LoadingState label="Carregando relatorios..." />
      ) : !categoryData.length ? (
        <EmptyState
          icon={<PieChartIcon className="h-5 w-5" />}
          title="Ainda nao ha dados para exibir"
          description="Cadastre uma transacao manualmente ou pelo assistente financeiro."
        />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-[#009C3B]" />
                <h2 className="font-extrabold text-[#222222]">Gastos por categoria</h2>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={2}
                    >
                      {categoryData.map((entry) => (
                        <Cell key={entry.category} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{ background: '#FFFFFF', border: '1px solid #DADADA', borderRadius: 6 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#009C3B]" />
                <h2 className="font-extrabold text-[#222222]">Ultimos dias com lancamentos</h2>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid stroke="#E5E5E5" vertical={false} />
                    <XAxis dataKey="label" stroke="#666666" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666666" fontSize={12} tickFormatter={(value) => `R$ ${Number(value) / 100}`} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ''}
                      contentStyle={{ background: '#FFFFFF', border: '1px solid #DADADA', borderRadius: 6 }}
                    />
                    <Bar dataKey="amount" fill="#009C3B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Tags className="h-5 w-5 text-[#009C3B]" />
              <h2 className="font-extrabold text-[#222222]">Ranking de categorias</h2>
            </div>
            <div className="space-y-3">
              {categoryData.map((item) => {
                const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;

                return (
                  <div key={item.category} className="border-b border-neutral-100 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <div className="flex items-center gap-2 font-bold text-[#222222]">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-extrabold text-[#222222]">{formatCurrency(item.value)}</p>
                        <p className="text-xs font-semibold text-[#666666]">{percent}% do total</p>
                      </div>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-neutral-100">
                      <div className="h-2 rounded-full" style={{ width: `${percent}%`, backgroundColor: item.color }} />
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
