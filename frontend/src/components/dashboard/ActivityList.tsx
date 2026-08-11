import { AlertTriangle, CheckCircle2, Flag, Receipt } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { CATEGORY_LABELS } from '@/types/transaction';
import { formatCurrency } from '@/utils/formatters';
import { sumExpenses } from '@/utils/finance';

export function ActivityList({ transactions }: { transactions: Transaction[] }) {
  const totalExpenses = sumExpenses(transactions);
  const topCategory = Object.entries(
    transactions.reduce<Record<string, number>>((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] ?? 0) + transaction.amount;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1])[0];

  const items = [
    {
      icon: CheckCircle2,
      text: 'Assistente financeiro por voz ativo',
      tone: 'text-[#009C3B]',
    },
    {
      icon: AlertTriangle,
      text: topCategory
        ? `Categoria com maior movimento: ${CATEGORY_LABELS[topCategory[0] as keyof typeof CATEGORY_LABELS]?.label ?? topCategory[0]}`
        : 'Sem categoria dominante no periodo',
      tone: 'text-[#8A6200]',
    },
    {
      icon: Receipt,
      text: `${transactions.length} transacoes registradas no sistema`,
      tone: 'text-[#666666]',
    },
    {
      icon: CheckCircle2,
      text: `Despesas monitoradas: ${formatCurrency(totalExpenses)}`,
      tone: 'text-[#D93025]',
    },
  ];

  return (
    <section className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-extrabold text-[#222222]">Atividades recentes</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.text} className="flex gap-3 border-b border-neutral-100 pb-3 last:border-b-0 last:pb-0">
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${item.tone}`} />
              <p className="text-sm font-medium leading-relaxed text-[#444444]">{item.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
