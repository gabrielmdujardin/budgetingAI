'use client';

import { Search } from 'lucide-react';
import { Category, CATEGORY_LABELS } from '@/types/transaction';

interface FilterBarProps {
  searchTerm: string;
  selectedCategory: string;
  selectedType: string;
  startDate: string;
  endDate: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClear: () => void;
}

export function FilterBar({
  searchTerm,
  selectedCategory,
  selectedType,
  startDate,
  endDate,
  onSearchChange,
  onCategoryChange,
  onTypeChange,
  onStartDateChange,
  onEndDateChange,
  onClear,
}: FilterBarProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_140px_140px_140px_auto]">
        <label className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar descrição..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition-all focus:border-emerald-500 focus:bg-white"
          />
        </label>

        <select
          value={selectedCategory}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:bg-white"
        >
          <option value="">Categoria</option>
          {Object.entries(CATEGORY_LABELS).map(([key, item]) => (
            <option key={key} value={key as Category}>
              {item.label}
            </option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(event) => onTypeChange(event.target.value)}
          className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:bg-white"
        >
          <option value="">Tipo</option>
          <option value="income">Receita</option>
          <option value="expense">Despesa</option>
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(event) => onStartDateChange(event.target.value)}
          className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:bg-white"
        />

        <input
          type="date"
          value={endDate}
          onChange={(event) => onEndDateChange(event.target.value)}
          className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:bg-white"
        />

        <button
          onClick={onClear}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          Limpar
        </button>
      </div>
    </div>
  );
}
