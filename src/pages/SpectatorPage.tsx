import { useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useSpectatorStore } from '../features/spectator/store/spectatorStore'
import { useSpectatorSignalR } from '../features/spectator/hooks/useSpectatorSignalR'
import { SpectatorMap } from '../features/spectator/components/SpectatorMap'
import { spectatorApi } from '../features/spectator/api'
import { C, F } from '../shared/ds'
import { SpectatorStats } from '../features/spectator/components/SpectatorStats'
import { useUnits } from '../shared/hooks/useUnits'

export const SpectatorPage = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate  = useNavigate()
  const { event, error, setEvent, setError, clearSpectator, connectionStatus, applyLocationUpdate, setConnectionStatus } = useSpectatorStore()
  const { useMetric } = useUnits()

  useSpectatorSignalR(event ? id ?? null : null)

  useEffect(() => {
    if (!id) { navigate('/join'); return }
    if (!searchParams.get('units')) { navigate(`/events/${id}/units`); return }
    spectatorApi.getEventById(id)
      .then((e) => {
        if (e.status === 'Ended') {
          setError('This event has ended.')
          return
        }
        setEvent(e)

        if (e.lastLocation) {
          applyLocationUpdate(e.lastLocation)
        }
      })
      .catch(() => {
        if (import.meta.env.DEV) {
          setConnectionStatus('Connected')
          setEvent({
            id: 'dev-event',
            eventCode: '74K291',
            routeId: 'dev-route',
            route: {
              id: 'dev-route',
              name: 'Morning Half Marathon',
              waypoints: [
                { id: 'wp1', coordinates: [-0.1276, 51.5074], order: 0 },
                { id: 'wp2', coordinates: [-0.1200, 51.5200], order: 1 },
                { id: 'wp3', coordinates: [-0.1050, 51.5250], order: 2 },
              ],
              segments: [],
              totalDistance: 21100,
              createdAt: new Date(Date.now() - 4200000).toISOString(),
              updatedAt: new Date(Date.now() - 4200000).toISOString(),
            },
            status: 'Active',
            createdAt: new Date(Date.now() - 4200000).toISOString(),
            startedAt: new Date(Date.now() - 4200000).toISOString(),
            finishedAt: null,
            endedAt: null,
            lastLocation: null,
          })
          applyLocationUpdate({
            coordinates: [-0.1180, 51.5160],
            timestamp: new Date().toISOString(),
            distanceFromStart: 7400,
            currentPaceSecondsPerMile: 342,
            averagePaceSecondsPerMile: 339,
          })
        } else {
          setError('Event not found. The code may be invalid or expired.')
        }
      })
    return () => clearSpectator()
  }, [id])

  if (error) {
    return (
      <div style={centerStyle}>
        <p style={{ fontFamily: F.ui, color: C.red, textAlign: 'center', maxWidth: 280, marginBottom: 16 }}>{error}</p>
        <button onClick={() => navigate('/join')} style={backBtn}>Try another code</button>
      </div>
    )
  }

  if (!event) {
    return (
      <div style={centerStyle}>
        <p style={{ fontFamily: F.ui, color: C.textSecondary }}>Connecting...</p>
      </div>
    )
  }

  return (
    <div style={{ height: '100dvh', position: 'relative', overflow: 'hidden', backgroundColor: C.base }}>

      {/* Full-screen map */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <SpectatorMap />
      </div>

      {/* Top overlays: name pill + LIVE badge */}
      <div style={{
        position: 'absolute', top: 16, left: 16, right: 16, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 14px 7px 8px', borderRadius: 100,
          background: 'rgba(10,11,13,.75)', backdropFilter: 'blur(10px)',
          border: `1px solid ${C.hairline}`,
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: C.elevated, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: F.display, fontSize: 10, fontWeight: 700, color: C.textPrimary, flexShrink: 0,
          }}>
            {event.route.name.slice(0, 1).toUpperCase()}
          </div>
          <span style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 600, color: C.textPrimary }}>
            {event.route.name}
          </span>
        </div>

        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 100,
          background: 'rgba(200,249,78,0.15)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(200,249,78,0.2)',
          fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: C.volt, letterSpacing: '.04em',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.volt, animation: 'rsBlink 1.2s infinite' }} />
          LIVE
        </span>
      </div>

      {/* Connection status bar */}
      {connectionStatus !== 'Connected' && (
        <div style={{
          position: 'absolute', top: 60, left: 16, right: 16, zIndex: 10,
          padding: '7px 14px', borderRadius: 10,
          background: 'rgba(10,11,13,.85)', backdropFilter: 'blur(8px)',
          fontFamily: F.ui, fontSize: 12, color: C.textSecondary, textAlign: 'center',
        }}>
          {connectionStatus === 'Disconnected' ? 'Connection lost — pull to refresh' : 'Connecting to racer...'}
        </div>
      )}

      <SpectatorStats useMetric={useMetric} />
    </div>
  )
}

const centerStyle: React.CSSProperties = {
  height: '100dvh', backgroundColor: C.base,
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center', padding: '0 24px',
}

const backBtn: React.CSSProperties = {
  padding: '11px 22px', borderRadius: 100,
  border: `1px solid ${C.hairline}`, background: C.elevated,
  color: C.textSecondary, fontFamily: F.ui, fontWeight: 600, fontSize: 14, cursor: 'pointer',
}
