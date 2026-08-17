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

const inputClasses =
  'rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-all focus:border-primary focus:bg-surface-hover';

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
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 shadow-xl">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_140px_140px_140px_auto]">
        <label className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar descrição..."
            className={`w-full pl-9 pr-3 ${inputClasses}`}
          />
        </label>

        <select
          value={selectedCategory}
          onChange={(event) => onCategoryChange(event.target.value)}
          className={inputClasses}
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
          className={inputClasses}
        >
          <option value="">Tipo</option>
          <option value="income">Receita</option>
          <option value="expense">Despesa</option>
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(event) => onStartDateChange(event.target.value)}
          className={inputClasses}
        />

        <input
          type="date"
          value={endDate}
          onChange={(event) => onEndDateChange(event.target.value)}
          className={inputClasses}
        />

        <button
          onClick={onClear}
          className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-hover hover:text-text"
        >
          Limpar
        </button>
      </div>
    </div>
  );
}
