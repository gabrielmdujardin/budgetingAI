import { CATEGORY_LABELS, Category } from '@/types/transaction';

export function CategoryBadge({ category }: { category: Category; compact?: boolean }) {
  const item = CATEGORY_LABELS[category] ?? CATEGORY_LABELS.OTHER;

  return (
    <span className="inline-flex items-center rounded-full bg-surface-hover px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
      {item.label}
    </span>
  );
}
