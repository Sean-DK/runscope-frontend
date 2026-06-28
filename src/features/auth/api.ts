import { fetchClient } from '../../shared/utils/fetchClient'
import { AuthUser, UnitPreference } from './types'

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export const authApi = {
  getMe: async (): Promise<AuthUser | null> => {
    try {
      return await fetchClient<AuthUser>('/api/auth/me')
    } catch {
      return null
    }
  },

  updatePreferences: async (unitPreference: UnitPreference): Promise<void> => {
    await fetchClient('/api/users/me/preferences', {
        method: 'PATCH',
        body: { unitPreference },
    })
  },

  getGoogleSignInUrl: (returnUrl: string): string => {
    const params = new URLSearchParams({ returnUrl })
    return `${BASE}/api/auth/google?${params.toString()}`
  },

  signOut: async (): Promise<void> => {
    await fetchClient('/api/auth/sign-out', { method: 'POST' })
  },
}