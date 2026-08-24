import { CATEGORY_LABELS, Category } from '@/types/transaction';
import { Tag } from 'lucide-react';

export function CategoryBadge({ category, customCategory }: { category: Category | string; customCategory?: string; compact?: boolean }) {
  // Se for uma categoria customizada (string solta ou customCategory preenchido)
  if (customCategory || (typeof category === 'string' && !CATEGORY_LABELS[category as Category])) {
    const label = customCategory || category;
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-bold text-primary">
        <Tag className="w-3.5 h-3.5" />
        {label}
      </span>
    );
  }

  const item = CATEGORY_LABELS[category as Category] ?? CATEGORY_LABELS.OTHER;

  return (
    <span className="inline-flex items-center rounded-full bg-surface-hover px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
      {item.label}
    </span>
  );
}
