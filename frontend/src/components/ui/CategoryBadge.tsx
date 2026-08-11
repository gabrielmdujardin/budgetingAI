import { CATEGORY_LABELS, Category } from '@/types/transaction';

export function CategoryBadge({ category }: { category: Category; compact?: boolean }) {
  const item = CATEGORY_LABELS[category] ?? CATEGORY_LABELS.OTHER;

  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-bold text-[#444444]">
      {item.label}
    </span>
  );
}
