import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSpectatorStore } from '../features/spectator/store/spectatorStore'
import { useSpectatorSignalR } from '../features/spectator/hooks/useSpectatorSignalR'
import { SpectatorMap } from '../features/spectator/components/SpectatorMap'
import { SpectatorStats } from '../features/spectator/components/SpectatorStats'
import { spectatorApi } from '../features/spectator/api'

export const SpectatorPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { event, error, setEvent, setError, clearSpectator } = useSpectatorStore()

  // SignalR connection — starts once event is loaded
  useSpectatorSignalR(event ? id ?? null : null)

  // Load event on mount
  useEffect(() => {
    if (!id) {
      navigate('/join')
      return
    }

    spectatorApi.getEventById(id)
      .then((e) => {
        if (e.status === 'Ended') {
          setError('This event has ended.')
          return
        }
        setEvent(e)
      })
      .catch(() => setError('Event not found. The code may be invalid or expired.'))

    return () => clearSpectator()
  }, [id])

  if (error) {
    return (
      <div style={centerStyle}>
        <p style={{ color: '#fca5a5', marginBottom: 16, textAlign: 'center', maxWidth: 280 }}>
          {error}
        </p>
        <button onClick={() => navigate('/join')} style={backButtonStyle}>
          Try Another Code
        </button>
      </div>
    )
  }

  if (!event) {
    return (
      <div style={centerStyle}>
        <p style={{ color: '#94a3b8' }}>Loading event...</p>
      </div>
    )
  }

  return (
    <div style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#0f172a',
      overflow: 'hidden',
    }}>
      {/* Map — top half */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <SpectatorMap />
      </div>

      {/* Stats — bottom half */}
      <div style={{
        height: '45%',
        flexShrink: 0,
        borderTop: '1px solid #1e293b',
        overflow: 'auto',
      }}>
        <SpectatorStats />
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