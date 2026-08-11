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
    <section className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_190px_150px_150px_150px_auto]">
        <label className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[#666666]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por descricao"
            className="w-full rounded-md border border-neutral-300 bg-white py-2.5 pl-9 pr-3 text-sm text-[#222222] outline-none transition-colors focus:border-[#009C3B]"
          />
        </label>

        <select
          value={selectedCategory}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm text-[#222222] outline-none focus:border-[#009C3B]"
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
          className="rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm text-[#222222] outline-none focus:border-[#009C3B]"
        >
          <option value="">Tipo</option>
          <option value="income">Receita</option>
          <option value="expense">Despesa</option>
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(event) => onStartDateChange(event.target.value)}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm text-[#222222] outline-none focus:border-[#009C3B]"
        />

        <input
          type="date"
          value={endDate}
          onChange={(event) => onEndDateChange(event.target.value)}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm text-[#222222] outline-none focus:border-[#009C3B]"
        />

        <button
          onClick={onClear}
          className="rounded-md border border-neutral-300 px-4 py-2.5 text-sm font-bold text-[#444444] transition-colors hover:bg-neutral-50"
        >
          Limpar
        </button>
      </div>
    </section>
  );
}
