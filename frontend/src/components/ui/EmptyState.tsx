import type { ReactNode } from 'react';

export function EmptyState({ title, description }: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-12 text-center shadow-lg">
      <p className="font-bold text-text">{title}</p>
      {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
    </div>
  );
}
