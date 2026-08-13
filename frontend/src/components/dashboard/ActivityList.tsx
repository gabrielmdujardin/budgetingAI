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
      label: 'Maior movimento',
      val: topCategory
        ? CATEGORY_LABELS[topCategory[0] as keyof typeof CATEGORY_LABELS]?.label ?? topCategory[0]
        : 'Sem registros',
    },
    {
      label: 'Total de movimentações',
      val: `${transactions.length} registros`,
    },
    {
      label: 'Total de despesas',
      val: formatCurrency(totalExpenses),
    },
  ];

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6">
      <h2 className="text-base font-bold tracking-tight text-gray-900 mb-4">Resumo das Atividades</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{item.label}</span>
            <span className="text-sm font-extrabold text-gray-900">{item.val}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
