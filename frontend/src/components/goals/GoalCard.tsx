interface GoalCardProps {
  name: string;
  target: string;
  current: string;
  percent: number;
  deadline: string;
}

export function GoalCard({ name, target, current, percent, deadline }: GoalCardProps) {
  return (
    <article className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#222222]">{name}</h2>
          <p className="mt-1 text-sm text-[#666666]">Prazo: {deadline}</p>
        </div>
        <span className="rounded-full bg-[#009C3B]/10 px-3 py-1 text-sm font-extrabold text-[#006B2B]">
          {percent}%
        </span>
      </div>
      <div className="mt-5 flex justify-between gap-4 text-sm">
        <div>
          <p className="font-bold text-[#666666]">Valor atual</p>
          <p className="mt-1 font-mono text-lg font-extrabold text-[#222222]">{current}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-[#666666]">Objetivo</p>
          <p className="mt-1 font-mono text-lg font-extrabold text-[#222222]">{target}</p>
        </div>
      </div>
      <div className="mt-5 h-3 rounded-full bg-neutral-100">
        <div className="h-3 rounded-full bg-[#009C3B]" style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
    </article>
  );
}
