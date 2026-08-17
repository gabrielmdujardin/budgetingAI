'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ListChecks, Volume2, Wallet } from 'lucide-react';
import { Orb } from '@/components/voice/Orb';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { Transaction, VoiceResponse } from '@/types/transaction';
import { formatCurrency, formatDate } from '@/utils/formatters';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  voiceResponse?: VoiceResponse;
  audioUrl?: string;
}

interface ChatBubbleProps {
  message: ChatMessage;
  onSpeak: (text: string) => void;
}

import { isIncomeCategory } from '@/utils/finance';

function AssistantBubble({ message, onSpeak }: ChatBubbleProps) {
  const vr = message.voiceResponse;

  return (
    <motion.div
      className="flex items-end gap-3 max-w-[85%]"
      initial={{ opacity: 0, x: -16, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* Mini orb avatar */}
      <div className="shrink-0 mb-1">
        <Orb state="idle" size="sm" />
      </div>

      <div className="space-y-2">
        {/* Main bubble */}
        <div className="relative rounded-2xl rounded-bl-sm bg-surface border border-border shadow-lg px-4 py-3 text-sm text-text leading-relaxed">
          <p>{message.text}</p>
          <div className="flex items-center justify-between gap-3 mt-2 pt-2 border-t border-border">
            <span className="text-xs text-text-secondary">{message.timestamp}</span>
            <button
              onClick={() => onSpeak(message.text)}
              className="text-primary hover:text-primary/80 transition-colors"
              title="Ouvir resposta"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Balance card */}
        {typeof vr?.balance === 'number' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-4 shadow-lg text-white"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100 mb-1">
              <Wallet className="w-3.5 h-3.5" /> Saldo estimado
            </div>
            <p className="text-2xl font-extrabold">{formatCurrency(vr.balance)}</p>
          </motion.div>
        )}

        {/* Transaction created card */}
        {vr?.transaction && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl bg-surface border border-primary/30 shadow-lg p-4 text-sm"
          >
            <div className="flex items-center gap-1.5 text-primary font-bold mb-2 text-xs">
              <CheckCircle2 className="w-4 h-4" /> Transacao registrada
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-text truncate">{vr.transaction.description}</span>
              <span className={isIncomeCategory(vr.transaction.category) ? 'font-extrabold text-primary shrink-0' : 'font-extrabold text-rose-400 shrink-0'}>
                {isIncomeCategory(vr.transaction.category) ? '+' : '-'} {formatCurrency(vr.transaction.amount)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <CategoryBadge category={vr.transaction.category} />
              <span className="text-xs text-text-secondary">{formatDate(vr.transaction.createdAt)}</span>
            </div>
          </motion.div>
        )}

        {/* Transactions list */}
        {vr?.transactions && vr.transactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-surface border border-border shadow-lg p-4"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase mb-3">
              <ListChecks className="w-4 h-4 text-primary" /> Lancamentos
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {vr.transactions.map((t: any) => {
                const isIncome = t.type === 'income' || isIncomeCategory(t.category);
                const dateStr = t.date || t.createdAt;
                return (
                  <div key={t.id} className="flex items-center justify-between gap-3 py-1.5 border-b border-border last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text truncate">{t.description}</p>
                      {dateStr && <p className="text-xs text-text-secondary">{formatDate(dateStr)}</p>}
                    </div>
                    <span className={isIncome ? 'text-sm font-extrabold text-primary shrink-0' : 'text-sm font-extrabold text-rose-400 shrink-0'}>
                      {isIncome ? '+' : '-'} {formatCurrency(t.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function UserBubble({ message }: { message: ChatMessage }) {
  return (
    <motion.div
      className="flex justify-end max-w-[80%] ml-auto"
      initial={{ opacity: 0, x: 16, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="rounded-2xl rounded-br-sm bg-gradient-to-br from-emerald-500 to-emerald-600 px-4 py-3 shadow-lg">
        <p className="text-sm text-white leading-relaxed">{message.text}</p>
        <p className="text-right text-xs text-emerald-200 mt-1">{message.timestamp}</p>
      </div>
    </motion.div>
  );
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  onSpeak: (text: string) => void;
}

export function ChatMessages({ messages, onSpeak }: ChatMessagesProps) {
  if (messages.length === 0) return null;

  return (
    <div className="space-y-5 px-4 py-4 w-full max-w-3xl mx-auto">
      <AnimatePresence initial={false}>
        {messages.map((msg) =>
          msg.role === 'user' ? (
            <UserBubble key={msg.id} message={msg} />
          ) : (
            <AssistantBubble key={msg.id} message={msg} onSpeak={onSpeak} />
          )
        )}
      </AnimatePresence>
    </div>
  );
}
