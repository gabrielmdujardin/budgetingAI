'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, PlusCircle, Loader2 } from 'lucide-react';
import { Category, CATEGORY_LABELS } from '@/types/transaction';
import { transactionService } from '@/services/transactionService';

const categoryValues = Object.keys(CATEGORY_LABELS) as [Category, ...Category[]];

const transactionSchema = z.object({
  description: z.string().trim().min(1, 'A descricao e obrigatoria'),
  amount: z.number().positive('O valor deve ser positivo'),
  category: z.enum(categoryValues, { message: 'A categoria e obrigatoria' }),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TransactionFormModal({ isOpen, onClose, onSuccess }: TransactionFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: '',
    },
  });

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    setSubmitError('');
    onClose();
  };

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      await transactionService.createTransaction({
        description: data.description,
        amount: Math.round(data.amount * 100),
        category: data.category,
      });

      reset();
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Erro ao criar transacao:', err);
      setSubmitError('Nao foi possivel salvar a transacao. Verifique se o backend esta rodando.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="relative w-full max-w-lg rounded-md border border-neutral-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-[#222222]">
            <PlusCircle className="h-5 w-5 text-[#009C3B]" /> Cadastrar transacao
          </h2>
          <button onClick={handleClose} className="rounded-md p-1 text-[#666666] transition-colors hover:bg-neutral-100 hover:text-[#222222]" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-[#666666]">Descricao</label>
            <input
              type="text"
              {...register('description')}
              placeholder="Ex: Compra no supermercado"
              className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm text-[#222222] outline-none transition-colors focus:border-[#009C3B]"
            />
            {errors.description && <p className="text-xs font-semibold text-[#D93025]">{errors.description.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-[#666666]">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('amount', { valueAsNumber: true })}
              placeholder="0,00"
              className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2.5 font-mono text-sm text-[#222222] outline-none transition-colors focus:border-[#009C3B]"
            />
            {errors.amount && <p className="text-xs font-semibold text-[#D93025]">{errors.amount.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-[#666666]">Categoria</label>
            <select
              {...register('category')}
              className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm text-[#222222] outline-none transition-colors focus:border-[#009C3B]"
            >
              <option value="">Selecione uma categoria...</option>
              {Object.entries(CATEGORY_LABELS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-xs font-semibold text-[#D93025]">{errors.category.message}</p>}
          </div>

          {submitError && (
            <div className="rounded-md border border-[#D93025]/30 bg-[#D93025]/10 px-3 py-2 text-sm font-semibold text-[#D93025]">
              {submitError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md border border-neutral-300 px-4 py-2.5 text-sm font-bold text-[#444444] transition-colors hover:bg-neutral-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-md bg-[#009C3B] px-5 py-2.5 text-sm font-extrabold text-white transition-colors hover:bg-[#006B2B] disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar transacao
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
