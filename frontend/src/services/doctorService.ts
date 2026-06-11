import api from '../config/axios.config';
import type { Doctor, ApiResponse } from '../types';

export const doctorService = {
  async getDoctors(): Promise<Doctor[]> {
    const res = await api.get<ApiResponse<Doctor[]>>('/doctors');
    return res.data.data;
  },

  async getDoctorById(id: string): Promise<Doctor> {
    const res = await api.get<ApiResponse<Doctor>>(`/doctors/${id}`);
    return res.data.data;
  }
};
