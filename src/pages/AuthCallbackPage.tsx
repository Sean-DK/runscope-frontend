import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'
import { useAuthStore } from '../features/auth/store/authStore'
import { AuthUser } from '../features/auth/types'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export const AuthCallbackPage = () => {
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const { checkSession } = useAuth()
  const setUser        = useAuthStore((state) => state.setUser)
  const hasRun         = useRef(false)

  const returnUrl = searchParams.get('returnUrl') ?? '/'
  const token     = searchParams.get('token')

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const authenticate = async () => {
      if (token) {
        try {
          const response = await fetch(`${API_BASE}/api/auth/exchange`, {
            method:      'POST',
            credentials: 'include',
            headers:     { 'Content-Type': 'application/json' },
            body:        JSON.stringify({ token }),
            cache:       'no-store',
          })
          const text = await response.text()
          if (!response.ok) throw new Error(`Exchange failed: ${response.status}`)
          const user = JSON.parse(text) as AuthUser
          setUser(user)
        } catch {
          await checkSession()
        }
      } else {
        await checkSession()
      }
      navigate(returnUrl, { replace: true })
    }

    authenticate()
  }, [])

  return (
    <div style={{
      minHeight:       '100dvh',
      backgroundColor: '#0f172a',
      display:         'flex',
      flexDirection:   'column',
      alignItems:      'center',
      justifyContent:  'center',
      gap:             12,
      color:           '#e2e8f0',
    }}>
      <div style={{
        width:        32,
        height:       32,
        borderRadius: '50%',
        border:       '3px solid #1e293b',
        borderTopColor: '#3b82f6',
        animation:    'spin 0.8s linear infinite',
      }} />
      <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
        Signing you in...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}