'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, Paperclip, Send, Square } from 'lucide-react';
import { clsx } from 'clsx';
import { Orb, type OrbState } from '@/components/voice/Orb';
import { ChatMessages, type ChatMessage } from '@/components/voice/ChatMessages';
import { transactionService } from '@/services/transactionService';
import { VoiceResponse } from '@/types/transaction';

/* ─── Helpers ─────────────────────────────────────────────────── */
const now = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

function speakText(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'pt-BR';
  u.rate = 1;
  window.speechSynthesis.speak(u);
}

/* ─── Typing Indicator Component ────────────────────────────── */
function TypingIndicator() {
  return (
    <motion.div
      className="flex items-end gap-3 px-4 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
    >
      <div className="shrink-0 mb-1">
        <Orb state="thinking" size="sm" />
      </div>
      <div className="bg-white/90 backdrop-blur-sm border border-white/60 rounded-2xl rounded-bl-sm px-4 py-3 shadow-md">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-emerald-500"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Center Empty State (3D Orb + Suggestions) ─────────────── */
interface EmptyStateProps {
  orbState: OrbState;
  onSelectSuggestion: (text: string) => void;
}

function EmptyState({ orbState, onSelectSuggestion }: EmptyStateProps) {
  const suggestions = [
    'Quanto tenho de saldo?',
    'Gastei R$ 80 no mercado',
    'Liste meus gastos',
    'Paguei 150 de academia',
  ];

  return (
    <motion.div
      className="flex flex-col items-center justify-center flex-1 gap-6 px-4 py-8 text-center my-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
    >
      <Orb state={orbState} size="lg" />

      <div>
        <h2 className="text-white/90 font-bold text-xl tracking-tight">Como posso ajudar?</h2>
        <p className="text-white/50 text-sm mt-1">Fale ou escreva um comando financeiro</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center max-w-md">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSelectSuggestion(suggestion)}
            className="text-xs px-3 py-2 rounded-full border border-white/10 text-white/60 bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-400/40 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Main Assistant Page Component ──────────────────────────── */
export default function AssistantPage() {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const audioUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  useEffect(() => {
    const urls = audioUrlsRef.current;
    return () => {
      urls.forEach(URL.revokeObjectURL);
      window.speechSynthesis?.cancel();
    };
  }, []);

  /* ── Recording Controls ── */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined;
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        const type = mr.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type });
        await processAudio(blob);
      };

      mr.start();
      setIsRecording(true);
      setOrbState('listening');
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((p) => p + 1), 1000);
    } catch {
      setOrbState('idle');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
    setDuration(0);
  };

  /* ── Process Audio via Backend ── */
  const processAudio = async (blob: Blob) => {
    setOrbState('thinking');
    setIsProcessing(true);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: `🎤 Áudio gravado (${formatTimer(duration)})`,
      timestamp: now(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const result: VoiceResponse = await transactionService.sendVoiceCommand(blob);
      handleVoiceResponse(result, result.transcription || 'Áudio enviado');
    } catch {
      pushAssistantMessage('Não consegui processar o áudio. Verifique se o backend e o serviço de transcrição estão rodando.');
      setOrbState('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  /* ── Process Voice Response ── */
  const handleVoiceResponse = (result: VoiceResponse, transcription: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === 'user' && last.text.startsWith('🎤')) {
        return [...prev.slice(0, -1), { ...last, text: transcription }];
      }
      return prev;
    });

    setOrbState('speaking');
    pushAssistantMessage(result.message, result);
    speakText(result.message);

    setTimeout(() => setOrbState('idle'), 3000);

    if (result.action === 'CREATE_TRANSACTION') {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    }
  };

  const pushAssistantMessage = (text: string, vr?: VoiceResponse) => {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      text,
      timestamp: now(),
      voiceResponse: vr,
    };
    setMessages((prev) => [...prev, msg]);
  };

  /* ── Send Text Command ── */
  const handleSendText = (overrideText?: string) => {
    const text = (overrideText || textInput).trim();
    if (!text) return;
    setTextInput('');

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
      timestamp: now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);
    setOrbState('thinking');

    setTimeout(() => {
      pushAssistantMessage('No momento aceito comandos de voz via áudio. Use o botão de microfone para interagir com a IA!');
      setOrbState('idle');
      setIsProcessing(false);
    }, 800);
  };

  /* ── File Upload Handler ── */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: `Áudio: ${file.name}`,
      timestamp: now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    await processAudio(file);
  };

  const formatTimer = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full w-full rounded-xl border border-white/10 overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(135deg, #071A0D 0%, #0A1F12 40%, #0C2217 100%)' }}>
      {/* Container Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-white/5 backdrop-blur-md">
        <div>
          <h1 className="text-white font-bold text-lg tracking-tight">Olá, Gabriel</h1>
          <p className="text-white/60 text-xs mt-0.5">Sua assistente financeira</p>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <span
            className={clsx(
              'w-2.5 h-2.5 rounded-full',
              orbState === 'idle'
                ? 'bg-emerald-400'
                : orbState === 'listening'
                ? 'bg-red-400 animate-pulse'
                : 'bg-amber-400 animate-pulse'
            )}
          />
          <span className="text-xs font-semibold text-white/80 capitalize">
            {orbState === 'idle'
              ? 'Pronta'
              : orbState === 'listening'
              ? 'Ouvindo'
              : orbState === 'thinking'
              ? 'Pensando'
              : 'Falando'}
          </span>
        </div>
      </header>

      {/* Main Messages Content / Center Orb */}
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
        <AnimatePresence mode="wait">
          {messages.length === 0 && !isProcessing ? (
            <EmptyState
              key="empty"
              orbState={orbState}
              onSelectSuggestion={(text) => handleSendText(text)}
            />
          ) : (
            <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4">
              <ChatMessages messages={messages} onSpeak={speakText} />
              <AnimatePresence>
                {isProcessing && <TypingIndicator key="typing" />}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Live Recording Status Bar */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            className="flex items-center justify-between gap-4 px-6 py-3 bg-red-500/15 border-t border-red-500/30 shrink-0"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center gap-3">
              <motion.span
                className="w-3 h-3 rounded-full bg-red-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <span className="text-red-300 text-sm font-semibold">Gravando voz...</span>
              <span className="font-mono text-red-200 text-sm font-bold">{formatTimer(duration)}</span>
            </div>
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors shadow-md"
            >
              <Square className="w-3.5 h-3.5 fill-white" /> Parar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Pinned Input Bar */}
      <div className="shrink-0 px-4 py-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2.5 shadow-2xl">
          {/* Attach audio button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isRecording || isProcessing}
            className="text-white/40 hover:text-white transition-colors disabled:opacity-30 shrink-0 p-1"
            title="Anexar arquivo de áudio"
            aria-label="Anexar arquivo de áudio"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Text input */}
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendText();
              }
            }}
            placeholder="Digite ou use o microfone..."
            disabled={isRecording || isProcessing}
            className="flex-1 bg-transparent text-white placeholder-white/35 text-sm outline-none leading-relaxed disabled:opacity-30"
          />

          {/* Voice Microphone button */}
          <motion.button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={clsx(
              'shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-30',
              isRecording
                ? 'w-11 h-11 bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/40 text-white'
                : 'w-9 h-9 bg-white/15 hover:bg-emerald-500/30 text-white/70 hover:text-emerald-400'
            )}
            animate={{ scale: isRecording ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.6, repeat: isRecording ? Infinity : 0 }}
            title={isRecording ? 'Parar gravação' : 'Gravar voz'}
            aria-label={isRecording ? 'Parar gravação' : 'Gravar voz'}
          >
            {isRecording ? (
              <Square className="w-4 h-4 fill-white text-white" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </motion.button>

          {/* Send text button */}
          <button
            onClick={() => handleSendText()}
            disabled={!textInput.trim() || isProcessing || isRecording}
            className="shrink-0 w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg shadow-emerald-500/30"
            title="Enviar mensagem"
            aria-label="Enviar mensagem"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>

        <p className="text-center text-white/30 text-xs mt-2 font-medium">
          Pressione o microfone e fale um comando financeiro em português
        </p>
      </div>
    </div>
  );
}
