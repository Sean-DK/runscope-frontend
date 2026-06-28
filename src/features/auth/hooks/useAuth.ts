import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api'

export const useAuth = () => {
  const store = useAuthStore()
  const navigate = useNavigate()

  // Called once on app load to rehydrate session from cookie
  const checkSession = useCallback(async () => {
    store.setLoading(true)
    try {
      const user = await authApi.getMe()
      store.setUser(user)
    } finally {
      store.setLoading(false)
    }
  }, [store])

  const signIn = useCallback((returnUrl: string = '/') => {
    const url = authApi.getGoogleSignInUrl(returnUrl)
    const form = document.createElement('form')
    form.method = 'GET'
    form.action = url
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
  }, [])

  const signOut = useCallback(async () => {
    await authApi.signOut()
    store.clearUser()
    navigate('/', { state: { signedOut: true } })
  }, [store, navigate])

  return {
    user: store.user,
    isSignedIn: store.isSignedIn,
    isLoading: store.isLoading,
    checkSession,
    signIn,
    signOut,
  }
}