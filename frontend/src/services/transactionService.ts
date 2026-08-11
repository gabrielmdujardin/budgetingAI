import { api } from './api';
import { Category, SummaryResponse, Transaction, TransactionRequest, VoiceResponse } from '@/types/transaction';

export const transactionService = {
  async getTransactions(params?: { category?: Category; startDate?: string; endDate?: string }): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>('/transactions', { params });
    return response.data;
  },

  async createTransaction(data: TransactionRequest): Promise<Transaction> {
    const response = await api.post<Transaction>('/transactions', data);
    return response.data;
  },

  async deleteTransaction(id: number): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },

  async getSummary(): Promise<SummaryResponse> {
    const response = await api.get<SummaryResponse>('/transactions/summary');
    return response.data;
  },

  async sendVoiceCommand(audioFile: File | Blob): Promise<VoiceResponse> {
    const formData = new FormData();
    const filename = audioFile instanceof File ? audioFile.name : 'voice_command.webm';
    formData.append('audio', audioFile, filename);

    const response = await api.post<VoiceResponse>('/transactions/voice', formData);
    return response.data;
  },
};
