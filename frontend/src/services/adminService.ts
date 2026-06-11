import api from '../config/axios.config';
import type { Analytics, Appointment, Notification, Schedule, Service, Doctor, ApiResponse } from '../types';

export const adminService = {
  async getAnalytics(): Promise<Analytics> {
    const res = await api.get<ApiResponse<Analytics>>('/admin/analytics');
    return res.data.data;
  },

  async getAllAppointments(): Promise<Appointment[]> {
    const res = await api.get<ApiResponse<Appointment[]>>('/admin/appointments');
    return res.data.data;
  },

  async createService(payload: Omit<Service, '_id'>): Promise<Service> {
    const res = await api.post<ApiResponse<Service>>('/admin/service', payload);
    return res.data.data;
  },

  async getServices(): Promise<Service[]> {
    const res = await api.get<ApiResponse<Service[]>>('/admin/services');
    return res.data.data;
  },

  async updateService(id: string, payload: Partial<Service>): Promise<Service> {
    const res = await api.put<ApiResponse<Service>>(`/admin/service/${id}`, payload);
    return res.data.data;
  },

  async deleteService(id: string): Promise<void> {
    await api.delete(`/admin/service/${id}`);
  },

  async createSchedule(payload: Omit<Schedule, '_id'>): Promise<Schedule> {
    const res = await api.post<ApiResponse<Schedule>>('/admin/schedule', payload);
    return res.data.data;
  },

  async getSchedule(doctorId: string): Promise<Schedule> {
    const res = await api.get<ApiResponse<Schedule>>(`/admin/schedule/${doctorId}`);
    return res.data.data;
  },

  async getNotifications(): Promise<Notification[]> {
    const res = await api.get<ApiResponse<Notification[]>>('/admin/notifications');
    return res.data.data;
  },

  async markNotificationRead(id: string): Promise<void> {
    await api.put(`/admin/notifications/${id}/read`);
  },

  async markAllNotificationsRead(): Promise<void> {
    await api.put('/admin/notifications/read-all');
  },

  async addDoctor(data: FormData | Omit<Doctor, '_id'>): Promise<Doctor> {
    const res = await api.post<ApiResponse<Doctor>>('/admin/doctor', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return res.data.data;
  },

  async getDoctors(): Promise<Doctor[]> {
    const res = await api.get<ApiResponse<Doctor[]>>('/admin/doctors');
    return res.data.data;
  },

  async updateDoctor(id: string, data: FormData | Partial<Doctor>): Promise<Doctor> {
    const res = await api.put<ApiResponse<Doctor>>(`/admin/doctor/${id}`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return res.data.data;
  },

  async deleteDoctor(id: string): Promise<void> {
    await api.delete(`/admin/doctor/${id}`);
  },
};
