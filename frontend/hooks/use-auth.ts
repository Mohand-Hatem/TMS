'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const USER_STORAGE_KEY = 'tms_user';

/**
 * Custom hook to retrieve the currently authenticated user.
 * 
 * ASSUMPTION FLAG & KEY DECISION:
 * The backend current implementation does not expose an active GET /api/auth/me endpoint. Instead,
 * both POST /api/auth/login and /register return the complete user payload ({ id, name, email, role })
 * while setting an httpOnly session cookie ('token'). To ensure smooth client-side rendering (CSR) across
 * browser refreshes without mutating the established backend contract, this hook leverages localStorage
 * ('tms_user') and TanStack Query cache ('auth', 'me'). It simultaneously attempts to query /api/auth/me
 * as a forward-compatible enhancement, gracefully defaulting to the locally cached session on HTTP 404.
 */
export function useUser() {
  return useQuery<User | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      // 1. Try to fetch from optional /api/auth/me endpoint if implemented on server in future
      try {
        const response = await api.get<AuthResponse>('/auth/me');
        const userData = response.data;
        if (typeof window !== 'undefined') {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        }
        return userData;
      } catch (error: any) {
        // If 404 (not implemented yet), fallback to localStorage user session
        if (error.response?.status === 404) {
          if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(USER_STORAGE_KEY);
            if (stored) {
              try {
                return JSON.parse(stored) as User;
              } catch {
                localStorage.removeItem(USER_STORAGE_KEY);
              }
            }
          }
          return null;
        }
        // If 401 Unauthorized, token cookie is expired or invalid
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(USER_STORAGE_KEY);
          }
          return null;
        }
        // For other network errors, attempt local cached session fallback
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(USER_STORAGE_KEY);
          if (stored) {
            try {
              return JSON.parse(stored) as User;
            } catch {
              localStorage.removeItem(USER_STORAGE_KEY);
            }
          }
        }
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
      }
      queryClient.setQueryData(['auth', 'me'], data);
      toast.success('Successfully logged in!');
      router.push('/projects');
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
      const response = await api.post<AuthResponse>('/auth/register', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
      }
      queryClient.setQueryData(['auth', 'me'], data);
      toast.success('Account created successfully!');
      router.push('/projects');
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSettled: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
      toast.info('You have been logged out.');
      router.push('/login');
    },
  });
}
