'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2, Mic, Send, Square, Upload, Volume2, X } from 'lucide-react';
import { transactionService } from '@/services/transactionService';
import { VoiceResponse } from '@/types/transaction';

type Status = 'idle' | 'recording' | 'processing' | 'completed' | 'error';

export interface VoiceAudioPreview {
  url: string;
  name: string;
  type: string;
}

interface VoiceRecorderProps {
  onResponse: (res: VoiceResponse, audio: VoiceAudioPreview) => void;
}

const statusLabel: Record<Status, string> = {
  idle: 'Pronto',
  recording: 'Gravando',
  processing: 'Processando',
  completed: 'Concluido',
  error: 'Erro',
};

export function VoiceRecorder({ onResponse }: VoiceRecorderProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [duration, setDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      setAudioBlob(null);
      setErrorMessage('');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined;
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const type = mediaRecorder.mimeType || 'audio/webm';
        setAudioBlob(new Blob(audioChunksRef.current, { type }));
      };

      mediaRecorder.start();
      setStatus('recording');
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((prev) => prev + 1), 1000);
    } catch (err) {
      console.error('Erro ao acessar microfone:', err);
      setStatus('error');
      setErrorMessage('Permissao do microfone negada ou indisponivel.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      clearTimer();
      setStatus('idle');
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    clearTimer();
    setAudioBlob(null);
    setDuration(0);
    setStatus('idle');
  };

  const sendAudio = async (fileOrBlobToSend?: Blob | File) => {
    const target = fileOrBlobToSend || audioBlob;
    if (!target) return;

    const audioPreview: VoiceAudioPreview = {
      url: URL.createObjectURL(target),
      name: target instanceof File ? target.name : 'Audio gravado',
      type: target.type || 'audio/webm',
    };

    setStatus('processing');
    setErrorMessage('');

    try {
      const result = await transactionService.sendVoiceCommand(target);
      setStatus('completed');
      onResponse(result, audioPreview);
      setAudioBlob(null);
      setDuration(0);
    } catch (err) {
      console.error('Erro ao enviar audio:', err);
      setStatus('error');
      URL.revokeObjectURL(audioPreview.url);
      setErrorMessage('Nao foi possivel processar o audio. Verifique se o backend e o servico de transcricao estao rodando.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) sendAudio(file);
    event.target.value = '';
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-xl">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm font-bold text-text">
          <Volume2 className="h-4 w-4 text-primary" />
          <span>Comando por voz</span>
        </div>
        <span className="text-xs font-bold text-text-secondary">
          Status: <strong className="text-primary">{statusLabel[status]}</strong>
        </span>
      </div>

      {status === 'recording' && (
        <div className="mt-4 flex flex-col justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-rose-500"></span>
            <span className="font-mono text-lg font-extrabold text-rose-400">{formatTimer(duration)}</span>
            <span className="text-xs font-semibold text-text-secondary">Gravando audio...</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={stopRecording} className="rounded-xl bg-rose-500 p-2 text-white transition-colors hover:bg-rose-600" title="Parar gravacao">
              <Square className="h-4 w-4 fill-white" />
            </button>
            <button onClick={cancelRecording} className="rounded-xl border border-border p-2 text-text-secondary transition-colors hover:bg-surface-hover" title="Cancelar">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {status === 'processing' && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm font-semibold text-primary">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Processando audio...</span>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm font-semibold text-rose-400">
          <AlertCircle className="h-5 w-5" />
          <span>{errorMessage || 'Ocorreu um erro no processamento do audio.'}</span>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {status !== 'recording' && (
          <button
            onClick={startRecording}
            disabled={status === 'processing'}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-background transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Mic className="h-4 w-4" /> Gravar audio
          </button>
        )}

        {audioBlob && status !== 'recording' && status !== 'processing' && (
          <button
            onClick={() => sendAudio()}
            className="flex items-center gap-2 rounded-xl border border-primary px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
          >
            <Send className="h-4 w-4" /> Enviar audio
          </button>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="audio/*"
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={status === 'processing' || status === 'recording'}
          className="flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-xs font-bold text-text-secondary transition-colors hover:bg-surface-hover disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" /> Upload de audio
        </button>
      </div>
    </div>
  );
}
