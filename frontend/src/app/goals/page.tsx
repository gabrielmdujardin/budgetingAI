import { PlusCircle } from 'lucide-react';
import { GoalCard } from '@/components/goals/GoalCard';

const goals = [
  { name: 'Viagem', target: 'R$ 6.000,00', current: 'R$ 3.600,00', percent: 60, deadline: '15/12/2026' },
  { name: 'Reserva de Emergencia', target: 'R$ 12.000,00', current: 'R$ 8.400,00', percent: 70, deadline: '30/06/2027' },
  { name: 'Curso profissional', target: 'R$ 2.500,00', current: 'R$ 900,00', percent: 36, deadline: '10/03/2027' },
];

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#222222]">Metas</h1>
          <p className="mt-1 text-base font-medium text-[#666666]">Acompanhe seus objetivos financeiros</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-md bg-[#009C3B] px-4 py-2.5 text-sm font-extrabold text-white transition-colors hover:bg-[#006B2B]">
          <PlusCircle className="h-4 w-4" /> Nova meta
        </button>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {goals.map((goal) => (
          <GoalCard key={goal.name} {...goal} />
        ))}
      </section>

      <section className="rounded-md border border-[#F4B400]/50 bg-[#F4B400]/10 p-5">
        <h2 className="text-lg font-extrabold text-[#222222]">Pendencia funcional</h2>
        <p className="mt-2 text-sm font-medium leading-relaxed text-[#666666]">
          O backend atual nao possui endpoint de metas. A pagina foi preparada visualmente com exemplos estaticos para preservar o escopo visual sem alterar a API Spring Boot.
        </p>
      </section>
    </div>
  );
}
