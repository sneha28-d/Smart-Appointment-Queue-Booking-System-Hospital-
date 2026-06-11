import api from '../config/axios.config';
import type { Appointment, BookAppointmentPayload, UpdateAppointmentPayload, ApiResponse } from '../types';

export const appointmentService = {
  async getSlots(doctorId: string, date: string): Promise<string[]> {
    const res = await api.get<ApiResponse<string[]>>('/appointments/slots', {
      params: { doctorId, date },
    });
    return res.data.data;
  },

  async bookAppointment(payload: BookAppointmentPayload): Promise<Appointment> {
    const res = await api.post<ApiResponse<Appointment>>('/appointments', payload);
    return res.data.data;
  },

  async getUserAppointments(): Promise<Appointment[]> {
    const res = await api.get<ApiResponse<Appointment[]>>('/appointments/user');
    return res.data.data;
  },

  async getAppointmentById(id: string): Promise<Appointment> {
    const res = await api.get<ApiResponse<Appointment>>(`/appointments/${id}`);
    return res.data.data;
  },

  async updateAppointment(id: string, payload: UpdateAppointmentPayload): Promise<Appointment> {
    const res = await api.put<ApiResponse<Appointment>>(`/appointments/${id}`, payload);
    return res.data.data;
  },

  async cancelAppointment(id: string): Promise<void> {
    await api.delete(`/appointments/${id}`);
  },
};
