import { useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useSpectatorStore } from '../features/spectator/store/spectatorStore'
import { useSpectatorSignalR } from '../features/spectator/hooks/useSpectatorSignalR'
import { SpectatorMap } from '../features/spectator/components/SpectatorMap'
import { SpectatorStats } from '../features/spectator/components/SpectatorStats'
import { spectatorApi } from '../features/spectator/api'
import { C, F } from '../shared/ds'

export const SpectatorPage = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const useMetric = searchParams.get('units') === 'kilometers'
  const navigate = useNavigate()
  const { event, stats, error, setEvent, setError, clearSpectator, connectionStatus } = useSpectatorStore()

  useSpectatorSignalR(event ? id ?? null : null)

  useEffect(() => {
    if (!id) { navigate('/join'); return }
    if (!searchParams.get('units')) { navigate(`/events/${id}/units`); return }

    spectatorApi.getEventById(id)
      .then((e) => {
        if (e.status === 'Ended') { setError('This event has ended.'); return }
        setEvent(e)
      })
      .catch(() => setError('Event not found. The code may be invalid or expired.'))

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

  const totalDist = event.route.totalDistance ?? 0
  const remaining = stats.distanceRemainingMeters ?? totalDist
  const covered   = Math.max(0, totalDist - remaining)
  const pct       = totalDist > 0 ? Math.min(1, covered / totalDist) : 0

  const fmtDist = (m: number) => useMetric
    ? `${(m / 1000).toFixed(1)} km`
    : `${(m / 1609.344).toFixed(1)} mi`

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: C.base, overflow: 'hidden' }}>

      {/* Map area with overlays */}
      <div style={{ height: 420, flexShrink: 0, position: 'relative' }}>
        <SpectatorMap />

        {/* Runner name pill + LIVE badge (top left) */}
        <div style={{
          position: 'absolute', top: 16, left: 16, right: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10,
        }}>
          <div style={{
            display:       'flex',
            alignItems:    'center',
            gap:           8,
            padding:       '7px 14px 7px 8px',
            borderRadius:  100,
            background:    'rgba(10,11,13,.75)',
            backdropFilter: 'blur(8px)',
            border:        `1px solid ${C.hairline}`,
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
            display:       'inline-flex',
            alignItems:    'center',
            gap:           6,
            padding:       '6px 12px',
            borderRadius:  100,
            background:    'rgba(200,249,78,0.15)',
            backdropFilter: 'blur(8px)',
            border:        `1px solid rgba(200,249,78,0.2)`,
            fontFamily:    F.ui,
            fontSize:      11,
            fontWeight:    700,
            color:         C.volt,
            letterSpacing: '.04em',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.volt, animation: 'rsBlink 1.2s infinite' }} />
            LIVE
          </span>
        </div>

        {/* Progress card overlay (bottom of map) */}
        {totalDist > 0 && (
          <div style={{
            position:      'absolute',
            bottom:        16,
            left:          16,
            right:         16,
            background:    'rgba(10,11,13,.82)',
            backdropFilter: 'blur(10px)',
            borderRadius:  16,
            border:        `1px solid ${C.hairline}`,
            padding:       '12px 16px',
            zIndex:        10,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 700, color: C.textPrimary }}>
                {fmtDist(remaining)} to finish
              </span>
              <span style={{ fontFamily: F.display, fontSize: 13, fontWeight: 600, color: C.volt }}>
                {Math.round(pct * 100)}%
              </span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: C.elevated, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct * 100}%`, background: C.volt, borderRadius: 2, transition: 'width .5s ease' }} />
            </div>
          </div>
        )}

        {/* Connection status bar */}
        {connectionStatus !== 'Connected' && (
          <div style={{
            position:   'absolute',
            bottom:     0,
            left:       0,
            right:      0,
            padding:    '6px 16px',
            background: 'rgba(10,11,13,.9)',
            fontFamily: F.ui,
            fontSize:   12,
            color:      C.textSecondary,
            textAlign:  'center',
            zIndex:     10,
          }}>
            {connectionStatus === 'Disconnected' ? 'Connection lost — pull to refresh' : 'Connecting to racer...'}
          </div>
        )}
      </div>

      {/* Stats panel */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <SpectatorStats useMetric={useMetric} />
      </div>
    </div>
  )
}

const centerStyle: React.CSSProperties = {
  height:          '100dvh',
  backgroundColor: C.base,
  display:         'flex',
  flexDirection:   'column',
  alignItems:      'center',
  justifyContent:  'center',
  padding:         '0 24px',
}

const backBtn: React.CSSProperties = {
  padding:      '11px 22px',
  borderRadius: 100,
  border:       `1px solid ${C.hairline}`,
  background:   C.elevated,
  color:        C.textSecondary,
  fontFamily:   F.ui,
  fontWeight:   600,
  fontSize:     14,
  cursor:       'pointer',
}
