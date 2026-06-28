import { create } from 'zustand'
import { AuthUser } from '../types'

interface AuthStoreState {
  user: AuthUser | null
  isLoading: boolean

  // Computed
  isSignedIn: boolean

  // Actions
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  isLoading: true, // start true — we check session on app load
  isSignedIn: false,

  setUser: (user) => set({ user, isSignedIn: !!user }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearUser: () => set({ user: null, isSignedIn: false }),
}))