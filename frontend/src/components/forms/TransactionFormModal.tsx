'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { Category, CATEGORY_LABELS } from '@/types/transaction';
import { transactionService } from '@/services/transactionService';

const categoryValues = Object.keys(CATEGORY_LABELS) as [Category, ...Category[]];

const transactionSchema = z.object({
  description: z.string().trim().min(1, 'A descrição é obrigatória'),
  amount: z.number().positive('O valor deve ser positivo'),
  category: z.enum(categoryValues, { message: 'A categoria é obrigatória' }),
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
      console.error('Erro ao criar transação:', err);
      setSubmitError('Não foi possível salvar a transação. Verifique a conexão com a API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Nova Transação</h2>
          <button onClick={handleClose} className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Descrição</label>
            <input
              type="text"
              {...register('description')}
              placeholder="Ex: Mercado"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-emerald-500 focus:bg-white"
            />
            {errors.description && <p className="text-xs font-semibold text-rose-600">{errors.description.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('amount', { valueAsNumber: true })}
              placeholder="0,00"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-extrabold text-gray-900 outline-none transition-all focus:border-emerald-500 focus:bg-white"
            />
            {errors.amount && <p className="text-xs font-semibold text-rose-600">{errors.amount.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Categoria</label>
            <select
              {...register('category')}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-emerald-500 focus:bg-white"
            >
              <option value="">Selecione...</option>
              {Object.entries(CATEGORY_LABELS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-xs font-semibold text-rose-600">{errors.category.message}</p>}
          </div>

          {submitError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600">
              {submitError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
