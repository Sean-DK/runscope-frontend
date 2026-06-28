import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { SharedRouteDetail } from '../features/routes/components/SharedRouteDetail'
import { routesApi } from '../features/routes/api'
import { Route } from '../features/routes/types'

export const SharedRoutePage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [route, setRoute] = useState<Route | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Placeholder until auth is wired up
  const isSignedIn = false

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    routesApi.getShared(id)
      .then(setRoute)
      .catch(() => setError('This route could not be found or the link has expired.'))
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <div style={centerStyle}>
        <p style={{ color: '#94a3b8' }}>Loading route...</p>
      </div>
    )
  }

  if (error || !route) {
    return (
      <div style={centerStyle}>
        <p style={{ color: '#fca5a5', marginBottom: 16, textAlign: 'center', maxWidth: 280 }}>
          {error ?? 'Route not found.'}
        </p>
        <button onClick={() => navigate('/')} style={backButtonStyle}>
          Go Home
        </button>
      </div>
    )
  }

  return <SharedRouteDetail route={route} isSignedIn={isSignedIn} />
}

const centerStyle: React.CSSProperties = {
  height: '100dvh',
  backgroundColor: '#0f172a',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#e2e8f0',
  padding: '0 16px',
}

const backButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: 6,
  border: '1px solid #334155',
  backgroundColor: 'transparent',
  color: '#94a3b8',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
}