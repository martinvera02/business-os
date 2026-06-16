import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import type { Business, UserRole } from '@/types/database'

interface BusinessContext {
  business: Business
  role: UserRole
}

interface AuthState {
  user: User | null
  session: Session | null
  businessContext: BusinessContext | null
  isLoading: boolean

  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setBusinessContext: (ctx: BusinessContext | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  businessContext: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setBusinessContext: (businessContext) => set({ businessContext }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ user: null, session: null, businessContext: null, isLoading: false }),
}))
