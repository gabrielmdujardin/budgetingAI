interface GoalCardProps {
  name: string;
  target: string;
  current: string;
  percent: number;
  deadline: string;
}

export function GoalCard({ name, target, current, percent, deadline }: GoalCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl transition-all hover:bg-white/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-text">{name}</h2>
          <p className="mt-1 text-sm text-text-secondary">Prazo: {deadline}</p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-extrabold text-primary">
          {percent}%
        </span>
      </div>
      <div className="mt-5 flex justify-between gap-4 text-sm">
        <div>
          <p className="font-bold text-text-secondary">Valor atual</p>
          <p className="mt-1 font-mono text-lg font-extrabold text-text">{current}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-text-secondary">Objetivo</p>
          <p className="mt-1 font-mono text-lg font-extrabold text-text">{target}</p>
        </div>
      </div>
      <div className="mt-5 h-3 rounded-full bg-surface-hover">
        <div className="h-3 rounded-full bg-primary" style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
    </article>
  );
}
