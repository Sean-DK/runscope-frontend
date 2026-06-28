import { useSpectatorStore } from '../store/spectatorStore'
import { C, F, screenPad } from '../../../shared/ds'
import { CANCEL_REASONS } from '../../events/types'

const MILE = 1609.344
const KM   = 1000

const fmtPace = (spm: number | null, metric: boolean): string => {
  if (spm === null) return '—'
  const spu = metric ? spm / (MILE / KM) : spm
  const m   = Math.floor(spu / 60)
  const s   = Math.round(spu % 60)
  return `${m}:${String(s).padStart(2, '0')}${metric ? ' /km' : ' /mi'}`
}

const fmtElapsed = (seconds: number | null): string => {
  if (seconds === null) return '—'
  const h   = Math.floor(seconds / 3600)
  const m   = Math.floor((seconds % 3600) / 60)
  const s   = seconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

const fmtDist = (meters: number | null, metric: boolean): string => {
  if (meters === null) return '—'
  return metric
    ? `${(meters / KM).toFixed(2)} km`
    : `${(meters / MILE).toFixed(2)} mi`
}

const fmtETA = (ts: string | null): string => {
  if (!ts) return '—'
  return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

interface SpectatorStatsProps {
  useMetric: boolean
}

export const SpectatorStats = ({ useMetric }: SpectatorStatsProps) => {
  const { event, stats, connectionStatus } = useSpectatorStore()
  if (!event) return null

  const totalDist  = event.route.totalDistance ?? 0
  const remaining  = stats.distanceRemainingMeters ?? totalDist
  const covered    = Math.max(0, totalDist - remaining)
  const distCovered = fmtDist(covered, useMetric)
  const avgPace     = fmtPace(stats.averagePaceSecondsPerMile, useMetric)
  const elapsed     = fmtElapsed(stats.elapsedSeconds)
  const eta         = fmtETA(stats.estimatedFinishTimestamp)

  const statCells = [
    { label: 'Distance', value: distCovered },
    { label: 'Avg pace', value: avgPace },
    { label: 'Elapsed',  value: elapsed },
    { label: 'Est. finish', value: eta, highlight: true },
  ]

  return (
    <div style={{
      backgroundColor: C.base,
      display:         'flex',
      flexDirection:   'column',
      height:          '100%',
    }}>
      {/* Cancelled notice */}
      {event.status === 'Cancelled' && (
        <div style={{
          margin:  `12px ${screenPad}px 0`,
          padding: '12px 16px',
          background:    'rgba(255,82,71,.1)',
          border:        `1px solid rgba(255,82,71,.25)`,
          borderRadius:  12,
        }}>
          <p style={{ fontFamily: F.ui, fontSize: 13, color: C.red, margin: 0 }}>
            {event.cancelReason
              ? `Event cancelled — ${CANCEL_REASONS.find(r => r.value === event.cancelReason)?.label ?? event.cancelReason}`
              : 'Event cancelled'}
          </p>
        </div>
      )}

      {/* 2×2 stat grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap:     10,
        padding: `16px ${screenPad}px`,
      }}>
        {statCells.map(({ label, value, highlight }) => (
          <StatCard key={label} label={label} value={value} highlight={!!highlight} />
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: `0 ${screenPad}px 16px`, textAlign: 'center' }}>
        <p style={{ fontFamily: F.ui, fontSize: 11, color: C.textTertiary, margin: 0 }}>
          {connectionStatus === 'Connected'
            ? 'Auto-refresh · updates in real time'
            : connectionStatus === 'Reconnecting'
            ? 'Reconnecting...'
            : 'Connection lost'}
        </p>
      </div>
    </div>
  )
}

const StatCard = ({ label, value, highlight }: { label: string; value: string; highlight: boolean }) => (
  <div style={{
    background:   highlight ? 'transparent' : C.surface,
    border:       `1px solid ${highlight ? C.volt : C.hairline}`,
    borderRadius: 16,
    padding:      '14px 16px',
  }}>
    <p style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: highlight ? C.volt : C.textTertiary, margin: '0 0 6px' }}>
      {label}
    </p>
    <p style={{
      fontFamily:          F.display,
      fontSize:            22,
      fontWeight:          700,
      fontVariantNumeric:  'tabular-nums',
      color:               highlight ? C.volt : (value === '—' ? C.textTertiary : C.textPrimary),
      margin:              0,
      letterSpacing:       '-.01em',
    }}>
      {value}
    </p>
  </div>
)
