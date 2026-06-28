import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEventHost } from '../features/events/hooks/useEventHost'
import { routesApi } from '../features/routes/api'
import { Route } from '../features/routes/types'

const formatDistance = (meters: number): string => {
  const miles = meters / 1609.344
  return `${miles.toFixed(2)} mi`
}

export const EventSetupPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const routeId = searchParams.get('routeId')
  const { startEvent, isStarting, error, activeEvent } = useEventHost()
  const [route, setRoute] = useState<Route | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!routeId) {
      navigate('/routes')
      return
    }
    routesApi.getById(routeId)
      .then(setRoute)
      .catch(() => setLoadError('Route not found.'))
      .finally(() => setIsLoading(false))
  }, [routeId, navigate])

  // Navigate to host screen once event is created
  useEffect(() => {
    if (activeEvent) navigate(`/events/${activeEvent.id}/host`)
  }, [activeEvent, navigate])

  if (isLoading) {
    return (
      <div style={centerStyle}>
        <p style={{ color: '#94a3b8' }}>Loading route...</p>
      </div>
    )
  }

  if (loadError || !route) {
    return (
      <div style={centerStyle}>
        <p style={{ color: '#fca5a5', marginBottom: 16 }}>{loadError ?? 'Route not found.'}</p>
        <button onClick={() => navigate('/routes')} style={backButtonStyle}>
          Back to Routes
        </button>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: '#0f172a',
      color: '#e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      gap: '20px',
      boxSizing: 'border-box',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate(`/routes/${routeId}`)}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: 22,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          ‹
        </button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Start Event</h1>
      </div>

      {/* Route summary */}
      <div style={{
        padding: '16px',
        backgroundColor: '#1e1e2e',
        borderRadius: 10,
        border: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        <p style={{ margin: 0, fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Selected Route
        </p>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{route.name}</p>
        <p style={{ margin: 0, fontSize: 14, color: '#94a3b8' }}>
          {formatDistance(route.totalDistance)} · {route.waypoints.length} waypoints
        </p>
      </div>

      {/* Info callout */}
      <div style={{
        padding: '14px',
        backgroundColor: '#1e3a5f',
        borderRadius: 8,
        border: '1px solid #1d4ed833',
      }}>
        <p style={{ margin: 0, fontSize: 13, color: '#93c5fd', lineHeight: 1.6 }}>
          Your event will start immediately and spectators can join right away.
          Your race clock won't start until you cross the start line.
          Keep this app open during your race.
        </p>
      </div>

      {/* Error */}
      {error && (
        <p style={{
          margin: 0,
          padding: '10px 12px',
          backgroundColor: '#450a0a',
          border: '1px solid #991b1b',
          borderRadius: 6,
          fontSize: 13,
          color: '#fca5a5',
        }}>
          {error}
        </p>
      )}

      {/* Start button */}
      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={() => routeId && startEvent(routeId)}
          disabled={isStarting}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 10,
            border: 'none',
            backgroundColor: isStarting ? '#166534' : '#22c55e',
            color: 'white',
            fontWeight: 700,
            fontSize: 18,
            cursor: isStarting ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.15s ease',
          }}
        >
          {isStarting ? 'Starting...' : 'Start Event'}
        </button>
      </div>
    </div>
  )
}

const centerStyle: React.CSSProperties = {
  height: '100dvh',
  backgroundColor: '#0f172a',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#e2e8f0',
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