import { Loader2 } from 'lucide-react';

export function LoadingState({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md py-12 text-xs font-semibold text-text-secondary shadow-lg">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      {label || 'Carregando...'}
    </div>
  );
}
