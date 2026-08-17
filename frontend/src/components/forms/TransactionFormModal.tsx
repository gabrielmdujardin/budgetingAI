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

const inputClasses =
  'w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-all focus:border-primary focus:bg-surface-hover';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-[0_0_40px_rgba(16,185,129,0.08)]">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h2 className="text-lg font-bold text-text">Nova Transação</h2>
          <button onClick={handleClose} className="rounded-lg p-1 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Descrição</label>
            <input
              type="text"
              {...register('description')}
              placeholder="Ex: Mercado"
              className={inputClasses}
            />
            {errors.description && <p className="text-xs font-semibold text-rose-400">{errors.description.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('amount', { valueAsNumber: true })}
              placeholder="0,00"
              className={`${inputClasses} font-extrabold`}
            />
            {errors.amount && <p className="text-xs font-semibold text-rose-400">{errors.amount.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Categoria</label>
            <select
              {...register('category')}
              className={inputClasses}
            >
              <option value="">Selecione...</option>
              {Object.entries(CATEGORY_LABELS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-xs font-semibold text-rose-400">{errors.category.message}</p>}
          </div>

          {submitError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-400">
              {submitError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-background shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
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
