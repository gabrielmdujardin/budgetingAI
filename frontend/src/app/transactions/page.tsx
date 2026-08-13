'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Plus } from 'lucide-react';
import { TransactionFormModal } from '@/components/forms/TransactionFormModal';
import { FilterBar } from '@/components/transactions/FilterBar';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { transactionService } from '@/services/transactionService';
import { Category } from '@/types/transaction';
import { getTransactionTone } from '@/utils/finance';

const PAGE_SIZE = 8;

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const params = {
    category: selectedCategory ? (selectedCategory as Category) : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  const { data: transactions = [], isLoading, refetch } = useQuery({
    queryKey: ['transactions', params],
    queryFn: () => transactionService.getTransactions(params),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => transactionService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType ? getTransactionTone(transaction) === selectedType : true;
        return matchesSearch && matchesType;
      }),
    [transactions, searchTerm, selectedType]
  );

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  const pageTransactions = filteredTransactions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedType('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header — Clean single title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Transações</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Nova transação
        </button>
      </div>

      <FilterBar
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        selectedType={selectedType}
        startDate={startDate}
        endDate={endDate}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        onCategoryChange={(value) => {
          setSelectedCategory(value);
          setCurrentPage(1);
        }}
        onTypeChange={(value) => {
          setSelectedType(value);
          setCurrentPage(1);
        }}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onClear={clearFilters}
      />

      <section className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
        {isLoading ? (
          <LoadingState label="Carregando transações..." />
        ) : pageTransactions.length ? (
          <>
            <TransactionTable
              transactions={pageTransactions}
              onDelete={(id) => deleteMutation.mutate(id)}
              isDeleting={deleteMutation.isPending}
              showActions
            />
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 text-xs font-semibold text-gray-400">
              <span>
                Página {currentPage} de {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
                >
                  Próxima
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-6">
            <EmptyState
              icon={<CreditCard className="h-5 w-5" />}
              title="Nenhuma transação encontrada"
              description="Ajuste os filtros ou cadastre uma nova transação."
            />
          </div>
        )}
      </section>

      <TransactionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          refetch();
          queryClient.invalidateQueries({ queryKey: ['summary'] });
        }}
      />
    </div>
  );
}
