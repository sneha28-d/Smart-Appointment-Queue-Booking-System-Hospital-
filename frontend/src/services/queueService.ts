import api from '../config/axios.config';
import type { QueueEntry, ApiResponse } from '../types';

export const queueService = {
  async getQueue(appointmentId: string): Promise<QueueEntry> {
    const res = await api.get<ApiResponse<QueueEntry>>('/queue', {
      params: { appointmentId },
    });
    return res.data.data;
  },

  async checkIn(appointmentId: string): Promise<QueueEntry> {
    const res = await api.post<ApiResponse<QueueEntry>>('/queue/checkin', { appointmentId });
    return res.data.data;
  },

  async callNext(): Promise<QueueEntry> {
    const res = await api.post<ApiResponse<QueueEntry>>('/queue/callnext');
    return res.data.data;
  },

  async completeQueueItem(appointmentId: string): Promise<QueueEntry> {
    const res = await api.post<ApiResponse<QueueEntry>>('/queue/complete', { appointmentId });
    return res.data.data;
  },

  async skipQueueItem(appointmentId: string): Promise<QueueEntry> {
    const res = await api.post<ApiResponse<QueueEntry>>('/queue/skip', { appointmentId });
    return res.data.data;
  },
};
