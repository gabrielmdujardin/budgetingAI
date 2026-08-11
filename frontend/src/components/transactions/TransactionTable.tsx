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
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-neutral-50 text-xs font-bold uppercase text-[#666666]">
          <tr>
            <th className="border-b border-neutral-200 px-5 py-3">Data</th>
            <th className="border-b border-neutral-200 px-5 py-3">Descricao</th>
            <th className="border-b border-neutral-200 px-5 py-3">Categoria</th>
            <th className="border-b border-neutral-200 px-5 py-3">Tipo</th>
            <th className="border-b border-neutral-200 px-5 py-3 text-right">Valor</th>
            {showActions && <th className="border-b border-neutral-200 px-5 py-3 text-center">Acoes</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 bg-white">
          {visibleTransactions.map((transaction) => {
            const tone = getTransactionTone(transaction);
            const isIncome = tone === 'income';

            return (
              <tr key={transaction.id} className="transition-colors hover:bg-neutral-50">
                <td className="whitespace-nowrap px-5 py-4 text-xs font-semibold text-[#666666]">
                  {formatDate(transaction.createdAt)}
                </td>
                <td className="px-5 py-4 font-bold text-[#222222]">{transaction.description}</td>
                <td className="whitespace-nowrap px-5 py-4">
                  <CategoryBadge category={transaction.category} />
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      isIncome ? 'bg-[#0B8F3C]/10 text-[#0B8F3C]' : 'bg-[#D93025]/10 text-[#D93025]'
                    }`}
                  >
                    {isIncome ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td className={`px-5 py-4 text-right font-mono font-extrabold ${isIncome ? 'text-[#0B8F3C]' : 'text-[#D93025]'}`}>
                  {isIncome ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </td>
                {showActions && (
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => onDelete?.(transaction.id)}
                      disabled={isDeleting}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#666666] transition-colors hover:bg-[#D93025]/10 hover:text-[#D93025] disabled:opacity-50"
                      title="Excluir transacao"
                      aria-label="Excluir transacao"
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
