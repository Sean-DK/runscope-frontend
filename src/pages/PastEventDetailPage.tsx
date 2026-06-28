import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PastEventDetail } from '../features/events/components/PastEventDetail'
import { eventsApi } from '../features/events/api'
import { RaceEvent } from '../features/events/types'

export const PastEventDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<RaceEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    eventsApi.getByIdForReview(id)
      .then(setEvent)
      .catch(() => setError('Event not found.'))
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <div style={centerStyle}>
        <p style={{ color: '#94a3b8' }}>Loading event...</p>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div style={centerStyle}>
        <p style={{ color: '#fca5a5', marginBottom: 16 }}>
          {error ?? 'Event not found.'}
        </p>
        <button onClick={() => navigate('/events/past')} style={backButtonStyle}>
          Back to Past Events
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#0f172a', overflow: 'auto' }}>
      <PastEventDetail event={event} />
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