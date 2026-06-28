import { useNavigate } from 'react-router-dom'
import { RaceEvent, CANCEL_REASONS } from '../types'
import { EventStatusBadge } from './EventStatusBadge'

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

const formatDuration = (startedAt: string, finishedAt: string): string => {
  const seconds = Math.floor(
    (new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 1000
  )
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

const formatPace = (secondsPerMile: number): string => {
  const m = Math.floor(secondsPerMile / 60)
  const s = Math.round(secondsPerMile % 60)
  return `${m}:${String(s).padStart(2, '0')} /mi`
}

const formatDistance = (meters: number): string => {
  const miles = meters / 1609.344
  return `${miles.toFixed(2)} mi`
}

interface PastEventDetailProps {
  event: RaceEvent
}

export const PastEventDetail = ({ event }: PastEventDetailProps) => {
  const navigate = useNavigate()

  const cancelLabel = event.cancelReason
    ? CANCEL_REASONS.find((r) => r.value === event.cancelReason)?.label
    : null

  const duration =
    event.startedAt && event.finishedAt
      ? formatDuration(event.startedAt, event.finishedAt)
      : null

  const avgPace = event.lastLocation?.averagePaceSecondsPerMile ?? null
  const distanceCovered = event.lastLocation?.distanceFromStart ?? null

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      backgroundColor: '#1e1e2e',
      color: '#e2e8f0',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        borderBottom: '1px solid #1e293b',
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/events/past')}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: 22,
            cursor: 'pointer',
            lineHeight: 1,
            padding: 0,
            flexShrink: 0,
          }}
        >
          ‹
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            {event.route.name}
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
            {formatDate(event.createdAt)}
          </p>
        </div>
        <EventStatusBadge status={event.status} />
      </div>

      {/* Cancel reason */}
      {event.status === 'Cancelled' && cancelLabel && (
        <div style={{
          margin: '12px 16px 0',
          padding: '10px 14px',
          backgroundColor: '#450a0a',
          border: '1px solid #991b1b',
          borderRadius: 8,
        }}>
          <p style={{ margin: 0, fontSize: 13, color: '#fca5a5' }}>
            Cancelled — {cancelLabel}
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
      }}>
        <StatCell
          label="Final Time"
          value={duration ?? '--'}
        />
        <StatCell
          label="Avg Pace"
          value={avgPace !== null ? formatPace(avgPace) : '--'}
        />
        <StatCell
          label="Distance Covered"
          value={distanceCovered !== null ? formatDistance(distanceCovered) : '--'}
        />
        <StatCell
          label="Total Distance"
          value={formatDistance(event.route.totalDistance)}
        />
      </div>

      {/* Timeline */}
      <div style={{
        margin: '0 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        backgroundColor: '#0f172a',
        borderRadius: 10,
        border: '1px solid #1e293b',
        overflow: 'hidden',
      }}>
        <TimelineRow
          label="Event Created"
          value={formatTime(event.createdAt)}
          isLast={false}
        />
        {event.startedAt && (
          <TimelineRow
            label="Crossed Start Line"
            value={formatTime(event.startedAt)}
            isLast={false}
          />
        )}
        {event.finishedAt && (
          <TimelineRow
            label="Crossed Finish Line"
            value={formatTime(event.finishedAt)}
            isLast={false}
          />
        )}
        {event.endedAt && (
          <TimelineRow
            label="Event Ended"
            value={formatTime(event.endedAt)}
            isLast
          />
        )}
      </div>
    </div>
  )
}

const StatCell = ({ label, value }: { label: string; value: string }) => (
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
      fontSize: value === '--' ? 20 : 17,
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

const TimelineRow = ({
  label,
  value,
  isLast,
}: {
  label: string
  value: string
  isLast: boolean
}) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    borderBottom: isLast ? 'none' : '1px solid #1e293b',
  }}>
    <span style={{ fontSize: 13, color: '#94a3b8' }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'monospace', color: '#e2e8f0' }}>
      {value}
    </span>
  </div>
)