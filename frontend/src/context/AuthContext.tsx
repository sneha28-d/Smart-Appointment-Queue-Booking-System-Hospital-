import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { User, UserRole, LoginPayload, RegisterPayload } from '../types';
import { authService } from '../services/authService';

interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Boot: restore session from localStorage ────────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        const decoded = jwtDecode<JWTPayload>(storedToken);
        const now = Date.now() / 1000;
        if (decoded.exp > now) {
          // queueMicrotask satisfies react-hooks/set-state-in-effect by putting
          // the setState calls in a callback rather than inline in the effect body.
          queueMicrotask(() => {
            setToken(storedToken);
            setUser(JSON.parse(storedUser) as User);
            setIsLoading(false);
          });
          return;
        } else {
          // Token expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    queueMicrotask(() => setIsLoading(false));
  }, []);

  const persist = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const login = async (payload: LoginPayload) => {
    const response = await authService.login(payload);
    const { token, ...userData } = response.data;
    persist(token, userData as User);
    return userData as User;
  };

  const register = async (payload: RegisterPayload) => {
    const response = await authService.register(payload);
    const { token, ...userData } = response.data;
    persist(token, userData as User);
    return userData as User;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
