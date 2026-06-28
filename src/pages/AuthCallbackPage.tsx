import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'

export const AuthCallbackPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { checkSession } = useAuth()
  const hasRun = useRef(false)

  const returnUrl = searchParams.get('returnUrl') ?? '/'

  useEffect(() => {
    // Strict mode guard — prevent double-firing in development
    if (hasRun.current) return
    hasRun.current = true

    checkSession().then(() => {
      navigate(returnUrl, { replace: true })
    })
  }, [])

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      color: '#e2e8f0',
    }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        border: '3px solid #1e293b',
        borderTopColor: '#3b82f6',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
        Signing you in...
      </p>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}