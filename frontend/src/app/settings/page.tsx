import { Bell, Mic, User } from 'lucide-react';

const settings = [
  { icon: User, title: 'Perfil', description: 'Dados basicos do usuario exibido no header.' },
  { icon: Bell, title: 'Notificacoes', description: 'Alertas de gastos, metas e atividades relevantes.' },
  { icon: Mic, title: 'Comandos de voz', description: 'Permissoes de microfone e envio de audio ao backend.' },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <section className="border-b border-neutral-200 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#222222]">Configuracoes</h1>
        <p className="mt-1 text-base font-medium text-[#666666]">Preferencias e recursos da aplicacao</p>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {settings.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#009C3B]/10 text-[#006B2B]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-extrabold text-[#222222]">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#666666]">{item.description}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-extrabold text-[#222222]">Estado atual</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#666666]">
          Esta tela preserva o espaco de configuracoes na navegacao. Nao foram criados novos contratos com o backend.
        </p>
      </section>
    </div>
  );
}
