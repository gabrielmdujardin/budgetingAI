import { Bell, Mic, User } from 'lucide-react';

const settings = [
  { icon: User, title: 'Perfil', description: 'Dados basicos do usuario exibido no header.' },
  { icon: Bell, title: 'Notificacoes', description: 'Alertas de gastos, metas e atividades relevantes.' },
  { icon: Mic, title: 'Comandos de voz', description: 'Permissoes de microfone e envio de audio ao backend.' },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <section className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-text">Configuracoes</h1>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {settings.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl transition-all hover:bg-white/10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-text">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.description}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl">
        <h2 className="text-lg font-bold text-text">Estado atual</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          Esta tela preserva o espaco de configuracoes na navegacao. Nao foram criados novos contratos com o backend.
        </p>
      </section>
    </div>
  );
}
