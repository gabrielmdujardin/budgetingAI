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

function formatMessageText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={i} className="font-extrabold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
          {part.slice(2, -2)}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

import { useState } from 'react';

function ConfirmCategoryCard({ transaction }: { transaction: any }) {
  const [customCategory, setCustomCategory] = useState(transaction.customCategory || 'Outros');
  const [amount, setAmount] = useState(transaction.amount > 0 ? transaction.amount.toString() : '');
  const [description, setDescription] = useState(transaction.description || '');
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) return null;

  const handleConfirm = () => {
    setConfirmed(true);
    const parsedAmountReais = parseFloat(amount.replace(',', '.')) || 0;
    window.dispatchEvent(
      new CustomEvent('confirmCategoryCreation', {
        detail: {
          ...transaction,
          description: description || transaction.description,
          customCategory,
          amountReais: parsedAmountReais,
          amountInCents: Math.round(parsedAmountReais * 100),
        },
      })
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15, type: 'spring' }}
      className="rounded-2xl bg-surface/90 backdrop-blur-xl border border-emerald-500/40 shadow-2xl shadow-emerald-500/10 p-5 text-sm space-y-4"
    >
      <div className="flex items-center gap-2 text-emerald-500 font-bold text-[13px] uppercase tracking-wide">
        <CheckCircle2 className="w-4 h-4" /> Confirmar & Editar Categoria
      </div>
      <p className="text-text-secondary text-xs leading-relaxed">
        Revise ou corrija o nome da nova categoria e o valor antes de confirmar a criação do lançamento:
      </p>

      <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/10">
        <div>
          <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block mb-1">
            Nome da Categoria
          </label>
          <input
            type="text"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="Ex: Tatuagem, Cripto..."
            className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm font-semibold text-text outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block mb-1">
            Descrição
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição da transação"
            className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm font-medium text-text outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block mb-1">
            Valor em Reais (R$)
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-emerald-400 outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleConfirm}
          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-200 text-sm shadow-md shadow-emerald-500/20 cursor-pointer"
        >
          Confirmar e Criar Categoria
        </button>
      </div>
    </motion.div>
  );
}

function AssistantBubble({ message, onSpeak }: ChatBubbleProps) {
  const vr = message.voiceResponse;
  
  // Clean text for speech synthesis
  const cleanTextForSpeech = message.text.replace(/\*\*/g, '');

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
        <div className="relative rounded-2xl rounded-bl-sm bg-surface border border-border/50 shadow-xl shadow-black/5 px-5 py-4 text-[15px] text-text leading-relaxed">
          <p className="tracking-wide">{formatMessageText(message.text)}</p>
          <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-border/50">
            <span className="text-xs font-medium text-text-secondary/70">{message.timestamp}</span>
            <button
              onClick={() => onSpeak(cleanTextForSpeech)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300"
              title="Ouvir resposta"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Balance card */}
        {typeof vr?.balance === 'number' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 20 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400/90 to-emerald-700/90 backdrop-blur-xl border border-white/20 p-5 shadow-2xl shadow-emerald-900/20 text-white"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150 pointer-events-none">
              <Wallet className="w-24 h-24" />
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100/90 mb-1.5 tracking-wider uppercase">
              <Wallet className="w-4 h-4" /> Saldo estimado
            </div>
            <p className="text-3xl font-black tracking-tight">{formatCurrency(vr.balance)}</p>
          </motion.div>
        )}

        {/* Dynamic Cards list */}
        {vr?.cards && vr.cards.length > 0 && !vr.balance && !vr.transaction && (
          <div className="space-y-3">
            {vr.cards.map((c: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08, type: 'spring', damping: 20 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/90 to-emerald-800/90 backdrop-blur-xl border border-white/10 p-5 shadow-2xl shadow-emerald-900/20 text-white"
              >
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-100/80 mb-1.5 uppercase tracking-wide">
                  <Wallet className="w-4 h-4" /> {c.title}
                </div>
                <p className="text-2xl font-bold tracking-tight">{formatCurrency(c.value * 100)}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Category Confirmation Card */}
        {vr?.cards?.some(c => c.type === 'confirm_category') && vr.transaction && (
          <ConfirmCategoryCard transaction={vr.transaction} />
        )}

        {/* Transaction created card */}
        {vr?.transaction && !vr?.cards?.some(c => c.type === 'confirm_category') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: 'spring' }}
            className="rounded-2xl bg-surface/80 backdrop-blur-xl border border-emerald-500/30 shadow-2xl shadow-emerald-500/5 p-5 text-sm"
          >
            <div className="flex items-center gap-2 text-emerald-500 font-bold mb-3 text-[13px] uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4" /> Transação registrada
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-text text-base truncate">{vr.transaction.description}</span>
              <span className={isIncomeCategory(vr.transaction.category) ? 'font-black text-emerald-500 text-base shrink-0' : 'font-black text-rose-500 text-base shrink-0'}>
                {isIncomeCategory(vr.transaction.category) ? '+' : '-'} {formatCurrency(vr.transaction.amount)}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
              <CategoryBadge category={vr.transaction.category} />
              <span className="text-xs font-medium text-text-secondary/70">{formatDate(vr.transaction.createdAt)}</span>
            </div>
          </motion.div>
        )}

        {/* Transactions list */}
        {vr?.transactions && vr.transactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', damping: 25 }}
            className="rounded-2xl bg-surface/70 backdrop-blur-xl border border-white/5 shadow-2xl shadow-black/10 overflow-hidden"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-widest bg-black/5 px-5 py-3 border-b border-white/5">
              <ListChecks className="w-4 h-4 text-emerald-500" /> Lançamentos
            </div>
            <div className="max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent p-2">
              {vr.transactions.map((t: any, i: number) => {
                const isIncome = t.type === 'income' || isIncomeCategory(t.category);
                const dateStr = t.date || t.createdAt;
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + (i * 0.04) }}
                    key={t.id || t.description + i} 
                    className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-default"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0 scale-90 opacity-80 group-hover:opacity-100 transition-opacity">
                        <CategoryBadge category={t.category} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-text truncate tracking-tight">{t.description}</p>
                        {dateStr && <p className="text-[11px] font-medium text-text-secondary/70 mt-0.5">{formatDate(dateStr)}</p>}
                      </div>
                    </div>
                    <span className={isIncome ? 'text-[15px] font-black text-emerald-500 shrink-0' : 'text-[15px] font-black text-rose-500 shrink-0'}>
                      {isIncome ? '+' : '-'} {formatCurrency(t.amount > 1000 ? t.amount : t.amount * 100)}
                    </span>
                  </motion.div>
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
