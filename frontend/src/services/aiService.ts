import api from '../config/axios.config';
import type { ApiResponse } from '../types';

export interface ChatResponse {
  reply: string;
  analytics: {
    doctorName: string;
    speciality: string;
    avgWaitTime: string;
    peakHours: string[];
    lowRushHours: string[];
    busyDays: string[];
    lessBusyDays: string[];
    todayWaitingPatientsCount: number;
  };
}

export const aiService = {
  /**
   * Sends the user's message and optional doctor ID context to the Gemini AI API.
   * @param message Patient's message
   * @param doctorId Optional specific doctor ID for context
   */
  async sendMessage(message: string, doctorId?: string): Promise<ChatResponse> {
    const res = await api.post<ApiResponse<ChatResponse>>('/ai/chat', {
      message,
      doctorId
    });
    return res.data.data;
  }
};
