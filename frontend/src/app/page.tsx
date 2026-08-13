'use client';

import Link from 'next/link';
import { CreditCard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ActivityList } from '@/components/dashboard/ActivityList';
import { FinancialChart } from '@/components/dashboard/FinancialChart';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { transactionService } from '@/services/transactionService';
import { CATEGORY_LABELS } from '@/types/transaction';
import { formatCurrency } from '@/utils/formatters';
import { sumExpenses, sumIncome } from '@/utils/finance';

export default function DashboardPage() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['summary'],
    queryFn: () => transactionService.getSummary(),
  });

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionService.getTransactions(),
  });

  const totalIncome = summary?.totalIncome ?? sumIncome(transactions);
  const totalExpenses = summary?.totalExpenses ?? sumExpenses(transactions);
  const balance = summary?.total ?? (totalIncome - totalExpenses);
  const topCategoryEntry = summary?.categories
    ? Object.entries(summary.categories)
        .filter(([cat]) => !['SALARY', 'INVESTMENTS'].includes(cat))
        .sort((a, b) => b[1] - a[1])[0]
    : undefined;
  const topCategory = topCategoryEntry
    ? CATEGORY_LABELS[topCategoryEntry[0] as keyof typeof CATEGORY_LABELS]?.label
    : 'Sem registros';

  return (
    <div className="space-y-8">
      {/* Header — Clean single title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
      </div>

      {/* Primary Metrics Grid */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <DashboardCard
          title="Saldo Atual"
          value={loadingTransactions ? '...' : formatCurrency(balance)}
          tone={balance >= 0 ? 'income' : 'expense'}
        />
        <DashboardCard
          title="Receitas no Mês"
          value={loadingTransactions ? '...' : formatCurrency(totalIncome)}
          tone="income"
        />
        <DashboardCard
          title="Despesas no Mês"
          value={loadingSummary ? '...' : formatCurrency(totalExpenses)}
          tone="expense"
        />
      </section>

      {/* Main Charts Section */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        {loadingTransactions ? <LoadingState label="Carregando gráfico..." /> : <FinancialChart transactions={transactions} />}
        <div className="space-y-6">
          <DashboardCard
            title="Maior Categoria de Gasto"
            value={loadingSummary ? '...' : topCategory}
            tone="warning"
          />
          <ActivityList transactions={transactions} />
        </div>
      </section>

      {/* Recent Transactions Section */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-base font-bold tracking-tight text-gray-900">Transações Recentes</h2>
          <Link href="/transactions" className="text-xs font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700">
            Ver todas →
          </Link>
        </div>

        {loadingTransactions ? (
          <LoadingState label="Carregando transações..." />
        ) : transactions.length ? (
          <TransactionTable transactions={transactions} limit={5} />
        ) : (
          <EmptyState
            icon={<CreditCard className="h-5 w-5" />}
            title="Nenhuma transação cadastrada"
            description="Cadastre transações manualmente ou pelo assistente."
          />
        )}
      </section>
    </div>
  );
}
