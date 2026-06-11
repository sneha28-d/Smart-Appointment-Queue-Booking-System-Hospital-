import api from '../config/axios.config';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../types';

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', payload);
    return res.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', payload);
    return res.data;
  },
};
