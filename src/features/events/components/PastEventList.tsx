import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { eventsApi } from '../api'
import { RaceEvent } from '../types'
import { EventStatusBadge } from './EventStatusBadge'

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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

export const PastEventList = () => {
  const navigate = useNavigate()
  const [events, setEvents] = useState<RaceEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    eventsApi.getPast()
      .then(setEvents)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div style={centerStyle}>
        <p style={{ color: '#94a3b8' }}>Loading events...</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div style={centerStyle}>
        <p style={{ color: '#94a3b8' }}>No past events yet.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {events.map((event, i) => (
        <PastEventRow
          key={event.id}
          event={event}
          isLast={i === events.length - 1}
          onClick={() => navigate(`/events/past/${event.id}`)}
          formatDate={formatDate}
          formatDuration={formatDuration}
        />
      ))}
    </div>
  )
}

const PastEventRow = ({
  event,
  isLast,
  onClick,
  formatDate,
  formatDuration,
}: {
  event: RaceEvent
  isLast: boolean
  onClick: () => void
  formatDate: (iso: string) => string
  formatDuration: (start: string, finish: string) => string
}) => {
  const duration =
    event.startedAt && event.finishedAt
      ? formatDuration(event.startedAt, event.finishedAt)
      : null

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: isLast ? 'none' : '1px solid #1e293b',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
        backgroundColor: 'transparent',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0f172a')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0' }}>
          {event.route.name}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <EventStatusBadge status={event.status} />
        </div>
        <span style={{ fontSize: 12, color: '#64748b' }}>
          {formatDate(event.createdAt)}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {duration && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#94a3b8' }}>
              {duration}
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>final time</div>
          </div>
        )}
        <span style={{ color: '#475569', fontSize: 18 }}>›</span>
      </div>
    </div>
  )
}

const centerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px 24px',
}