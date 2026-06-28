export interface AuthUser {
  id: string
  email: string
  name: string
  avatarUrl: string | null
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean  // true while checking session on app load
  isSignedIn: boolean
}