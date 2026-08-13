import { Loader2 } from 'lucide-react';

export function LoadingState({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white py-12 text-xs font-semibold text-gray-400">
      <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
      {label || 'Carregando...'}
    </div>
  );
}
