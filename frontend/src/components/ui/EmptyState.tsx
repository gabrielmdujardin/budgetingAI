import type { ReactNode } from 'react';

export function EmptyState({ title, description }: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white px-4 py-12 text-center">
      <p className="font-bold text-gray-900">{title}</p>
      {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
    </div>
  );
}
