import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api'
import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'

export const useAuth = () => {
  const store = useAuthStore()
  const navigate = useNavigate()

  // Called once on app load to rehydrate session from cookie
  const checkSession = useCallback(async () => {
  store.setLoading(true)
  try {
    const user = await authApi.getMe()
    console.log('checkSession: getMe returned', user)
    store.setUser(user)
  } finally {
    store.setLoading(false)
  }
}, [store])

  const signIn = useCallback((returnUrl: string = '/') => {
    const url = authApi.getGoogleSignInUrl(returnUrl)
    
    if (Capacitor.isNativePlatform()) {
      Browser.open({ 
        url,
        windowName: '_blank',
        presentationStyle: 'popover',
      })
    } else {
      // Web — use form submit to bypass React Router
      const form = document.createElement('form')
      form.method = 'GET'
      form.action = url
      document.body.appendChild(form)
      form.submit()
      document.body.removeChild(form)
    }
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