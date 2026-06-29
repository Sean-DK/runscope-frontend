import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EventHostScreen } from '../features/events/components/EventHostScreen'
import { useEventHost } from '../features/events/hooks/useEventHost'
import { C, F } from '../shared/ds'

export const EventHostPage = () => {
  const navigate = useNavigate()
  const { activeEvent, rehydrateActiveEvent } = useEventHost()
  const [isRehydrating, setIsRehydrating] = useState(true)

  useEffect(() => {
    // If store already has an active event (normal flow), skip rehydration
    if (activeEvent) {
      setIsRehydrating(false)
      return
    }

    // Store is empty — try to recover from server (e.g. after page refresh)
    rehydrateActiveEvent().then((found) => {
      if (!found) navigate('/routes')
    }).finally(() => {
      setIsRehydrating(false)
    })
  }, [])

  if (isRehydrating) {
    return (
      <div style={{
        minHeight:       '100dvh',
        backgroundColor: C.base,
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        justifyContent:  'center',
        gap:             16,
      }}>
        <div style={{
          width:        32,
          height:       32,
          borderRadius: '50%',
          border:       `2.5px solid rgba(255,255,255,0.1)`,
          borderTopColor: C.volt,
          animation:    'rsSpin 0.7s linear infinite',
        }} />
        <p style={{ fontFamily: F.ui, fontSize: 14, color: C.textSecondary, margin: 0 }}>
          Reconnecting to event...
        </p>
        <style>{`@keyframes rsSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!activeEvent) return null

  return <EventHostScreen />
}