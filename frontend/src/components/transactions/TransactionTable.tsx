'use client';

import { Trash2 } from 'lucide-react';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { Transaction } from '@/types/transaction';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { getTransactionTone } from '@/utils/finance';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
  limit?: number;
  showActions?: boolean;
}

export function TransactionTable({
  transactions,
  onDelete,
  isDeleting,
  limit,
  showActions = false,
}: TransactionTableProps) {
  const visibleTransactions = typeof limit === 'number' ? transactions.slice(0, limit) : transactions;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-surface-hover text-xs font-semibold uppercase tracking-wider text-text-secondary">
          <tr>
            <th className="border-b border-border px-6 py-3">Data</th>
            <th className="border-b border-border px-6 py-3">Descrição</th>
            <th className="border-b border-border px-6 py-3">Categoria</th>
            <th className="border-b border-border px-6 py-3">Tipo</th>
            <th className="border-b border-border px-6 py-3 text-right">Valor</th>
            {showActions && <th className="border-b border-border px-6 py-3 text-center">Ações</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-transparent">
          {visibleTransactions.map((transaction) => {
            const tone = getTransactionTone(transaction);
            const isIncome = tone === 'income';

            return (
              <tr key={transaction.id} className="transition-colors hover:bg-surface-hover/50">
                <td className="whitespace-nowrap px-6 py-4 text-xs font-medium text-text-secondary">
                  {formatDate(transaction.createdAt)}
                </td>
                <td className="px-6 py-4 font-semibold text-text">{transaction.description}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <CategoryBadge category={transaction.category} />
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isIncome ? 'bg-primary/20 text-primary' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {isIncome ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td className={`px-6 py-4 text-right font-extrabold tracking-tight ${isIncome ? 'text-primary' : 'text-rose-400'}`}>
                  {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
                </td>
                {showActions && (
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onDelete?.(transaction.id)}
                      disabled={isDeleting}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-rose-500/20 hover:text-rose-400 disabled:opacity-50"
                      title="Excluir transação"
                      aria-label="Excluir transação"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
