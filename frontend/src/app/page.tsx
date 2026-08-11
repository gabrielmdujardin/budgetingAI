'use client';

import Link from 'next/link';
import { AlertTriangle, CreditCard, Flag, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
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

  const totalIncome = sumIncome(transactions);
  const totalExpenses = summary?.total ?? sumExpenses(transactions);
  const balance = totalIncome - totalExpenses;
  const topCategoryEntry = summary?.categories
    ? Object.entries(summary.categories).sort((a, b) => b[1] - a[1])[0]
    : undefined;
  const topCategory = topCategoryEntry
    ? CATEGORY_LABELS[topCategoryEntry[0] as keyof typeof CATEGORY_LABELS]?.label
    : 'Sem registros';

  return (
    <div className="space-y-6">
      <section className="border-b border-neutral-200 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#222222]">Dashboard</h1>
        <p className="mt-1 text-base font-medium text-[#666666]">Veja como estao suas financas</p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Saldo atual"
          value={loadingTransactions ? 'Carregando...' : formatCurrency(balance)}
          detail="Receitas menos despesas registradas"
          icon={<Wallet className="h-5 w-5" />}
          tone={balance >= 0 ? 'income' : 'expense'}
        />
        <DashboardCard
          title="Receitas no mes"
          value={loadingTransactions ? 'Carregando...' : formatCurrency(totalIncome)}
          detail="+12% em relacao ao mes anterior"
          icon={<TrendingUp className="h-5 w-5" />}
          tone="income"
        />
        <DashboardCard
          title="Despesas no mes"
          value={loadingSummary ? 'Carregando...' : formatCurrency(totalExpenses)}
          detail="-5% em relacao ao mes anterior"
          icon={<TrendingDown className="h-5 w-5" />}
          tone="expense"
        />
        <DashboardCard
          title="Metas ativas"
          value="3"
          detail="2 em dia · 1 em atraso"
          icon={<Flag className="h-5 w-5" />}
          tone="warning"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        {loadingTransactions ? <LoadingState label="Carregando grafico..." /> : <FinancialChart transactions={transactions} />}
        <div className="space-y-6">
          <DashboardCard
            title="Categoria que mais gastou"
            value={loadingSummary ? 'Carregando...' : topCategory}
            detail={topCategoryEntry ? formatCurrency(topCategoryEntry[1]) : 'Aguardando lancamentos'}
            icon={<AlertTriangle className="h-5 w-5" />}
            tone="warning"
          />
          <ActivityList transactions={transactions} />
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-extrabold text-[#222222]">Transacoes recentes</h2>
            <p className="text-sm text-[#666666]">Ultimos movimentos cadastrados</p>
          </div>
          <Link href="/transactions" className="text-sm font-extrabold text-[#006B2B] hover:text-[#009C3B]">
            Ver todas →
          </Link>
        </div>

        {loadingTransactions ? (
          <LoadingState label="Carregando transacoes..." />
        ) : transactions.length ? (
          <TransactionTable transactions={transactions} limit={5} />
        ) : (
          <div className="p-5">
            <EmptyState
              icon={<CreditCard className="h-5 w-5" />}
              title="Nenhuma transacao encontrada"
              description="Registre uma transacao manualmente ou usando comandos de voz."
            />
          </div>
        )}
      </section>
    </div>
  );
}
