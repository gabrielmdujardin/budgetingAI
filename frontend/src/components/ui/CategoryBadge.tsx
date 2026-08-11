import { CATEGORY_LABELS, Category } from '@/types/transaction';

export const CATEGORY_EMOJIS: Record<Category, string> = {
  FOOD: '🍔',
  HEALTH: '💊',
  TRANSPORT: '🚗',
  SHOPPING: '🛍️',
  LEISURE: '🎮',
  HOME: '🏠',
  EDUCATION: '📚',
  SERVICES: '🔧',
  INVESTMENTS: '📈',
  SALARY: '💰',
  OTHER: '•',
};

export function CategoryBadge({ category, compact = false }: { category: Category; compact?: boolean }) {
  const item = CATEGORY_LABELS[category] ?? CATEGORY_LABELS.OTHER;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-bold text-[#444444]">
      {!compact && <span>{CATEGORY_EMOJIS[category]}</span>}
      {item.label}
    </span>
  );
}
