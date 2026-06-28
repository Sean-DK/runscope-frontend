import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { EventHostScreen } from '../features/events/components/EventHostScreen'
import { useEventHost } from '../features/events/hooks/useEventHost'

export const EventHostPage = () => {
  const navigate = useNavigate()
  const { activeEvent } = useEventHost()

  // If no active event in store (e.g. page refresh), send back to routes
  // In future this could reload the event from the API if still active
  useEffect(() => {
    if (!activeEvent) navigate('/routes')
  }, [activeEvent, navigate])

  if (!activeEvent) return null

  return <EventHostScreen />
}