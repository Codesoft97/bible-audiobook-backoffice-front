'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import api from '@/lib/api';
import { User, LoginResponse, RegisterResponse, ApiErrorResponse } from '@/types';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await api.post<LoginResponse>('/api/auth/login', {
          email,
          password,
        });
        const { user: userData } = response.data.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        router.push('/books');
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw axiosError.response?.data || { message: 'An unexpected error occurred' };
      }
    },
    [router]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        await api.post<RegisterResponse>('/api/auth/register', {
          name,
          email,
          password,
        });
        router.push('/login?registered=true');
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw axiosError.response?.data || { message: 'An unexpected error occurred' };
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Continue with local logout even if API call fails
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      router.push('/login');
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
