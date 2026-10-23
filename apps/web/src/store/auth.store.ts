import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface GinaUser {
  id: string
  email: string
  phone?: string
  fullName: string
  avatarUrl?: string
  tier: 'free' | 'starter' | 'pro' | 'enterprise'
  kycLevel: 0 | 1 | 2 | 3 | 4 | 5
  walletBalance: number
  currency: string
  language: 'ar' | 'en'
  isEmailVerified: boolean
  isPhoneVerified: boolean
  mfaEnabled: boolean
  referralCode: string
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface RegisterData {
  email: string
  password: string
  fullName: string
  phone?: string
  language?: 'ar' | 'en'
  referralCode?: string
}

interface AuthState {
  user: GinaUser | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  setUser: (user: GinaUser) => void
  setTokens: (tokens: AuthTokens) => void
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateUser: (updates: Partial<GinaUser>) => void
  clearError: () => void
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function apiCall<T>(endpoint: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...options.headers as Record<string, string> }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null, tokens: null, isAuthenticated: false, isLoading: false, error: null,
      setUser: (user) => set({ user, isAuthenticated: true }),
      setTokens: (tokens) => set({ tokens }),
      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { user, tokens } = await apiCall<{ user: GinaUser; tokens: AuthTokens }>(
            '/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }
          )
          set({ user, tokens, isAuthenticated: true, isLoading: false })
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Login failed', isLoading: false })
          throw err
        }
      },
      loginWithGoogle: async () => { window.location.href = `${API_BASE}/api/v1/auth/google` },
      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const { user, tokens } = await apiCall<{ user: GinaUser; tokens: AuthTokens }>(
            '/api/v1/auth/register', { method: 'POST', body: JSON.stringify(data) }
          )
          set({ user, tokens, isAuthenticated: true, isLoading: false })
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Registration failed', isLoading: false })
          throw err
        }
      },
      logout: async () => {
        const { tokens } = get()
        try {
          if (tokens?.accessToken) await apiCall('/api/v1/auth/logout', { method: 'POST' }, tokens.accessToken)
        } finally {
          set({ user: null, tokens: null, isAuthenticated: false, error: null })
        }
      },
      updateUser: (updates) => set((s) => ({ user: s.user ? { ...s.user, ...updates } : null })),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'gina-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user, tokens: s.tokens, isAuthenticated: s.isAuthenticated }),
    }
  )
)
