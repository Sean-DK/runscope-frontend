import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface AuthGuardProps {
  children: React.ReactNode
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isSignedIn, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      navigate('/sign-in', {
        replace: true,
        state: { returnUrl: location.pathname + location.search },
      })
    }
  }, [isSignedIn, isLoading, navigate, location])

  // Show nothing while session check is in progress
  if (isLoading) return null

  if (!isSignedIn) return null

  return <>{children}</>
}