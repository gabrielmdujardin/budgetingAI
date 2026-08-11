import type { ReactNode } from 'react';

export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-md border border-dashed border-neutral-300 bg-white px-4 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-neutral-100 text-[#666666]">
        {icon}
      </div>
      <p className="mt-3 font-bold text-[#222222]">{title}</p>
      <p className="mt-1 text-sm text-[#666666]">{description}</p>
    </div>
  );
}
