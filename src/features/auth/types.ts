export type UnitPreference = 'Miles' | 'Kilometers'

export interface AuthUser {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  unitPreference: UnitPreference
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isSignedIn: boolean
}