'use client';

import { useQuery } from '@tanstack/react-query';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { LoadingState } from '@/components/ui/LoadingState';
import { transactionService } from '@/services/transactionService';
import { Category, CATEGORY_LABELS } from '@/types/transaction';
import { formatCurrency } from '@/utils/formatters';

export default function CategoriesPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['summary'],
    queryFn: () => transactionService.getSummary(),
  });

  const categories = Object.entries(CATEGORY_LABELS) as [Category, (typeof CATEGORY_LABELS)[Category]][];

  return (
    <div className="space-y-6">
      {/* Header — Clean single title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Categorias</h1>
      </div>

      {isLoading ? (
        <LoadingState label="Carregando categorias..." />
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map(([key, item]) => {
            const total = summary?.categories?.[key] ?? 0;

            return (
              <article key={key} className="rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:border-gray-200">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-bold text-gray-900">{item.label}</h2>
                  <CategoryBadge category={key} compact />
                </div>
                <p className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900">{formatCurrency(total)}</p>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
