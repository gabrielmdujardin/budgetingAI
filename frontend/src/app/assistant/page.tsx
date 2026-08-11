'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ListChecks, Volume2, Wallet } from 'lucide-react';
import { VoiceAudioPreview, VoiceRecorder } from '@/components/voice/VoiceRecorder';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { Transaction, VoiceResponse } from '@/types/transaction';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface CommandResult {
  id: string;
  transcription: string;
  response: string;
  audioUrl?: string;
  audioName?: string;
  transaction?: VoiceResponse['transaction'];
  transactions?: Transaction[];
  balance?: number;
  timestamp: string;
}

const now = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

function speakText(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pt-BR';
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

export default function AssistantPage() {
  const queryClient = useQueryClient();
  const audioUrlsRef = useRef<string[]>([]);
  const [results, setResults] = useState<CommandResult[]>([]);

  useEffect(() => {
    const audioUrls = audioUrlsRef.current;

    return () => {
      audioUrls.forEach((url) => URL.revokeObjectURL(url));
      window.speechSynthesis?.cancel();
    };
  }, []);

  const handleVoiceResponse = (response: VoiceResponse, audio: VoiceAudioPreview) => {
    audioUrlsRef.current.push(audio.url);

    const result: CommandResult = {
      id: crypto.randomUUID(),
      transcription: response.transcription || 'Audio enviado para transcricao',
      response: response.message,
      audioUrl: audio.url,
      audioName: audio.name,
      transaction: response.transaction,
      transactions: response.transactions,
      balance: response.balance,
      timestamp: now(),
    };

    setResults((prev) => [result, ...prev]);
    speakText(response.message);

    if (response.action === 'CREATE_TRANSACTION') {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="border-b border-neutral-200 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#222222]">Assistente financeiro</h1>
        <p className="mt-1 text-base font-medium text-[#666666]">Registre e consulte suas financas usando comandos de voz.</p>
      </section>

      <VoiceRecorder onResponse={handleVoiceResponse} />

      <section className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-extrabold text-[#222222]">Exemplos</h2>
        <div className="mt-4 grid gap-3 text-sm font-semibold text-[#444444] sm:grid-cols-2">
          <span className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">Gastei R$ 45 com almoco</span>
          <span className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">Quanto tenho de saldo?</span>
          <span className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">Liste meus gastos</span>
          <span className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">Quanto gastei com mercado?</span>
        </div>
      </section>

      <section className="rounded-md border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-5 py-4">
          <h2 className="text-lg font-extrabold text-[#222222]">Historico de comandos</h2>
          <p className="text-sm text-[#666666]">Transcricao, resposta e resultados retornados pelo backend</p>
        </div>

        {!results.length ? (
          <div className="px-5 py-10 text-sm font-medium text-[#666666]">
            Nenhum comando enviado nesta sessao.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {results.map((result) => (
              <article key={result.id} className="space-y-4 px-5 py-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div>
                    <p className="text-xs font-bold uppercase text-[#666666]">Voce disse</p>
                    <p className="mt-1 font-bold text-[#222222]">{result.transcription}</p>
                  </div>
                  <span className="text-xs font-semibold text-[#666666]">{result.timestamp}</span>
                </div>

                <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-medium leading-relaxed text-[#444444]">{result.response}</p>
                    <button
                      onClick={() => speakText(result.response)}
                      className="shrink-0 rounded-md border border-neutral-300 bg-white p-2 text-[#006B2B] transition-colors hover:bg-[#009C3B]/10"
                      title="Ouvir resposta"
                      aria-label="Ouvir resposta"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {result.audioUrl && (
                  <div className="rounded-md border border-neutral-200 p-3">
                    <p className="mb-2 text-xs font-bold text-[#666666]">{result.audioName || 'Seu audio'}</p>
                    <audio controls src={result.audioUrl} className="h-9 w-full" />
                  </div>
                )}

                {typeof result.balance === 'number' && (
                  <div className="rounded-md border border-[#009C3B]/30 bg-[#009C3B]/10 p-3">
                    <div className="flex items-center gap-2 text-[#006B2B]">
                      <Wallet className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase">Saldo estimado</span>
                    </div>
                    <p className="mt-1 text-2xl font-extrabold text-[#222222]">{formatCurrency(result.balance)}</p>
                  </div>
                )}

                {result.transaction && (
                  <div className="rounded-md border border-[#009C3B]/30 bg-[#009C3B]/10 p-3 text-sm">
                    <div className="flex items-center gap-1.5 font-extrabold text-[#006B2B]">
                      <CheckCircle2 className="h-4 w-4" /> Transacao cadastrada
                    </div>
                    <div className="mt-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <span className="font-bold text-[#222222]">{result.transaction.description}</span>
                      <strong className="font-mono text-[#222222]">{formatCurrency(result.transaction.amount)}</strong>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#666666]">
                      <CategoryBadge category={result.transaction.category} />
                      <span>{formatDate(result.transaction.createdAt)}</span>
                    </div>
                  </div>
                )}

                {result.transactions && result.transactions.length > 0 && (
                  <div className="rounded-md border border-neutral-200 p-3">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-[#666666]">
                      <ListChecks className="h-4 w-4 text-[#009C3B]" /> Lancamentos encontrados
                    </div>
                    <div className="max-h-60 divide-y divide-neutral-100 overflow-y-auto">
                      {result.transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between gap-4 py-2 text-sm">
                          <div className="min-w-0">
                            <p className="truncate font-bold text-[#222222]">{transaction.description}</p>
                            <p className="text-xs text-[#666666]">{formatDate(transaction.createdAt)}</p>
                          </div>
                          <strong className="shrink-0 font-mono text-[#D93025]">{formatCurrency(transaction.amount)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
