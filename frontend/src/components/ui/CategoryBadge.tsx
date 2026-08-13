import { CATEGORY_LABELS, Category } from '@/types/transaction';

export function CategoryBadge({ category }: { category: Category; compact?: boolean }) {
  const item = CATEGORY_LABELS[category] ?? CATEGORY_LABELS.OTHER;

  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
      {item.label}
    </span>
  );
}
