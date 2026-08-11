'use client';

import { useQuery } from '@tanstack/react-query';
import { PlusCircle, Tags } from 'lucide-react';
import { CategoryBadge, CATEGORY_EMOJIS } from '@/components/ui/CategoryBadge';
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
      <section className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#222222]">Categorias</h1>
          <p className="mt-1 text-base font-medium text-[#666666]">Organize suas movimentacoes financeiras</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-md border border-[#009C3B] px-4 py-2.5 text-sm font-extrabold text-[#006B2B] transition-colors hover:bg-[#009C3B]/10">
          <PlusCircle className="h-4 w-4" /> Nova categoria
        </button>
      </section>

      {isLoading ? (
        <LoadingState label="Carregando categorias..." />
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map(([key, item]) => {
            const total = summary?.categories?.[key] ?? 0;

            return (
              <article key={key} className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{CATEGORY_EMOJIS[key]}</span>
                    <div>
                      <h2 className="font-extrabold text-[#222222]">{item.label}</h2>
                      <p className="mt-1 text-sm text-[#666666]">Total registrado</p>
                    </div>
                  </div>
                  <CategoryBadge category={key} compact />
                </div>
                <p className="mt-5 font-mono text-2xl font-extrabold text-[#222222]">{formatCurrency(total)}</p>
              </article>
            );
          })}
        </section>
      )}

      <section className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Tags className="h-5 w-5 text-[#009C3B]" />
          <h2 className="text-lg font-extrabold text-[#222222]">Uso de categorias</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[#666666]">
          As categorias existentes continuam vindo do contrato atual do backend. Esta pagina organiza visualmente esses grupos sem alterar o modelo de dados.
        </p>
      </section>
    </div>
  );
}
