import { Loader2 } from 'lucide-react';

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white py-12 text-sm font-semibold text-[#666666]">
      <Loader2 className="h-4 w-4 animate-spin text-[#009C3B]" />
      {label}
    </div>
  );
}
