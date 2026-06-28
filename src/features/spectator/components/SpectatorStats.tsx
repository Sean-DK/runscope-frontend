import { useSpectatorStore } from '../store/spectatorStore'
import { EventStatusBadge } from '../../events/components/EventStatusBadge'
import { CANCEL_REASONS } from '../../events/types'

const MILE_IN_METERS = 1609.344
const KM_IN_METERS = 1000

const formatPace = (secondsPerMile: number | null, useMetric: boolean): string => {
  if (secondsPerMile === null) return '--'
  if (useMetric) {
    const secondsPerKm = secondsPerMile / (MILE_IN_METERS / KM_IN_METERS)
    const m = Math.floor(secondsPerKm / 60)
    const s = Math.round(secondsPerKm % 60)
    return `${m}:${String(s).padStart(2, '0')} /km`
  }
  const m = Math.floor(secondsPerMile / 60)
  const s = Math.round(secondsPerMile % 60)
  return `${m}:${String(s).padStart(2, '0')} /mi`
}

const formatElapsed = (seconds: number | null): string => {
  if (seconds === null) return '--'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

const formatDistance = (meters: number | null, useMetric: boolean): string => {
  if (meters === null) return '--'
  if (useMetric) {
    const km = meters / KM_IN_METERS
    return `${km.toFixed(2)} km`
  }
  const miles = meters / MILE_IN_METERS
  return `${miles.toFixed(2)} mi`
}

const formatEstimatedFinish = (
  durationSeconds: number | null,
  timestamp: string | null
): { duration: string; timeOfDay: string } => {
  if (durationSeconds === null || timestamp === null) {
    return { duration: '--', timeOfDay: '--' }
  }
  const h = Math.floor(durationSeconds / 3600)
  const m = Math.floor((durationSeconds % 3600) / 60)
  const s = durationSeconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  const duration = h > 0
    ? `${h}h ${pad(m)}m ${pad(s)}s`
    : `${m}m ${pad(s)}s`
  const timeOfDay = new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return { duration, timeOfDay }
}

interface SpectatorStatsProps {
  useMetric: boolean
}

export const SpectatorStats = ({ useMetric }: SpectatorStatsProps) => {
  const { event, stats, connectionStatus } = useSpectatorStore()

  if (!event) return null

  const estimatedFinish = formatEstimatedFinish(
    stats.estimatedFinishSeconds,
    stats.estimatedFinishTimestamp
  )

  return (
    <div style={{
      backgroundColor: '#0f172a',
      color: '#e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'auto',
    }}>

      {/* Event header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid #1e293b',
        flexShrink: 0,
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {event.route.name}
          </p>
        </div>
        <EventStatusBadge status={event.status} />
      </div>

      {/* Connection/waiting status */}
      {connectionStatus !== 'Connected' && (
        <div style={{
          padding: '8px 16px',
          backgroundColor: '#1e293b',
          borderBottom: '1px solid #1e293b',
        }}>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b', textAlign: 'center' }}>
            {connectionStatus === 'Disconnected'
              ? 'Connection lost. Refresh to reconnect.'
              : connectionStatus === 'Reconnecting'
              ? 'Reconnecting...'
              : 'Connecting to racer...'}
          </p>
        </div>
      )}

      {/* Pending hint */}
      {connectionStatus === 'Connected' && event.status === 'Pending' && (
        <div style={{
          padding: '8px 16px',
          backgroundColor: '#1e293b',
          borderBottom: '1px solid #1e293b',
        }}>
          <p style={{ margin: 0, fontSize: 12, color: '#fbbf24', textAlign: 'center' }}>
            Waiting for racer to cross the start line...
          </p>
        </div>
      )}

      {/* Cancelled notice */}
      {event.status === 'Cancelled' && (
        <div style={{
          margin: '12px 16px 0',
          padding: '10px 14px',
          backgroundColor: '#450a0a',
          border: '1px solid #991b1b',
          borderRadius: 8,
        }}>
          <p style={{ margin: 0, fontSize: 13, color: '#fca5a5' }}>
            {event.cancelReason
              ? `Event cancelled — ${CANCEL_REASONS.find(r => r.value === event.cancelReason)?.label ?? event.cancelReason}`
              : 'Event cancelled'}
          </p>
        </div>
      )}

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 1,
        backgroundColor: '#1e293b',
        border: '1px solid #1e293b',
        margin: '12px 16px',
        borderRadius: 10,
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <StatCell
          label="Current Pace"
          value={formatPace(stats.currentPaceSecondsPerMile, useMetric)}
        />
        <StatCell
          label="Avg Pace"
          value={formatPace(stats.averagePaceSecondsPerMile, useMetric)}
        />
        <StatCell
          label="Elapsed Time"
          value={formatElapsed(stats.elapsedSeconds)}
        />
        <StatCell
          label="Distance Remaining"
          value={formatDistance(stats.distanceRemainingMeters, useMetric)}
        />
        <StatCell
          label="Est. Finish In"
          value={estimatedFinish.duration}
        />
        <StatCell
          label="Est. Finish At"
          value={estimatedFinish.timeOfDay}
        />
      </div>
    </div>
  )
}

const StatCell = ({
  label,
  value,
}: {
  label: string
  value: string
}) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 8px',
    backgroundColor: '#0f172a',
    gap: 4,
    textAlign: 'center',
  }}>
    <span style={{
      fontSize: value === '--' ? 20 : 18,
      fontWeight: 700,
      color: value === '--' ? '#334155' : '#e2e8f0',
      fontFamily: value === '--' ? 'inherit' : 'monospace',
    }}>
      {value}
    </span>
    <span style={{
      fontSize: 10,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
    }}>
      {label}
    </span>
  </div>
)