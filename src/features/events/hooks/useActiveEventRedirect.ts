import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../auth/store/authStore'
import { useEventStore } from '../store/eventStore'
import { eventsApi } from '../api'

// Pages where we should NOT redirect even if there's an active event
// (the host page itself, and the event setup page)
const EXEMPT_PATHS = [
  '/events',
  '/sign-in',
  '/auth/callback',
]

export const useActiveEventRedirect = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isSignedIn = useAuthStore((state) => state.isSignedIn)
  const setActiveEvent = useEventStore((state) => state.setActiveEvent)
  const setHasTriggeredStartLine = useEventStore((state) => state.setHasTriggeredStartLine)
  const setHasTriggeredFinishLine = useEventStore((state) => state.setHasTriggeredFinishLine)

  const check = useCallback(async () => {
    if (!isSignedIn) return

    // Don't redirect if already on an event-related page
    const isExempt = EXEMPT_PATHS.some((p) => location.pathname.startsWith(p))
    if (isExempt) return

    try {
      const event = await eventsApi.getActive()
      if (!event) return

      // Restore store state
      setActiveEvent(event)
      if (event.startedAt) setHasTriggeredStartLine(true)
      if (event.finishedAt) setHasTriggeredFinishLine(true)

      // Redirect to host page
      navigate(`/events/${event.id}/host`)
    } catch {
      // No active event or error — proceed normally
    }
  }, [isSignedIn, location.pathname, navigate, setActiveEvent, setHasTriggeredStartLine, setHasTriggeredFinishLine])

  return { check }
}