import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'
import { C, F, screenPad } from '../shared/ds'
import { RunScopeLogo } from '../shared/components/AppHeader'

export const SignInPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isSignedIn, isLoading, signIn } = useAuth()

  // returnUrl passed from AuthGuard via location state
  const returnUrl: string = (location.state as { returnUrl?: string })?.returnUrl ?? '/'

  // If already signed in, skip this page
  useEffect(() => {
    if (!isLoading && isSignedIn) navigate(returnUrl, { replace: true })
  }, [isSignedIn, isLoading, navigate, returnUrl])

  if (isLoading) return null

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: C.base,
      display: 'flex',
      flexDirection: 'column',
      padding: `0 ${screenPad}px`,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 360,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
      }}>
        {/* Logo / app name */}
        <div style={{ textAlign: 'center' }}>
          <div
            onClick={() => navigate('/')}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          >
            <RunScopeLogo />
            <span style={{ fontFamily: F.display, fontWeight: 700, fontSize: 36, letterSpacing: '-.02em', color: C.textPrimary }}>
            RunScope
            </span>
          </div>
          <p style={{ fontFamily: F.ui, fontSize: 15, color: C.textSecondary, margin: 0, lineHeight: 1.55 }}>
            Share every mile, the moment it happens.
          </p>
        </div>

        {/* Sign in card */}
        <div style={{
          display:      'flex',
          flexDirection: 'column',
          alignItems:   'center',
          justifyContent: 'space-between',
          gap:          16,
          padding:      22,
          borderRadius: 22,
          border:       `1px solid ${C.hairline}`,
          background:   C.surface,
          color:        C.textPrimary,
          cursor:       'pointer',
          textAlign:    'left',
          width:        '100%',
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>
              Runner Sign In
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
              Sign in to create routes and host events
            </p>
          </div>

          <button
            onClick={() => signIn(returnUrl)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              width: '100%',
              padding: '12px 16px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: C.volt,
              color: C.base,
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            <GoogleIcon />
            Sign in with Google
          </button>
        </div>

        {/* Spectator bypass */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ textAlign: 'center', fontFamily: F.ui, fontSize: 13, color: C.textTertiary, margin: '0' }}>
            Here to watch a race?
          </p>
          <span
            onClick={() => navigate('/join')}
            style={{ color: C.volt, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
          >
            Join as a spectator — no sign in needed
          </span>
        </div>
      </div>
    </div>
  )
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
)