import { useEffect, useRef, useState } from 'react'
import { EventCodeDisplay } from './EventCodeDisplay'
import { EventStatusBadge } from './EventStatusBadge'
import { CancelEventModal } from './CancelEventModal'
import { useEventHost } from '../hooks/useEventHost'
import { CancelReason } from '../types'

const formatElapsed = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export const EventHostScreen = () => {
  const {
    activeEvent,
    isEnding,
    error,
    hasTriggeredStartLine,
    elapsedSeconds,
    endEvent,
    cancelEvent,
  } = useEventHost()

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [displaySeconds, setDisplaySeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Local elapsed timer — updates every second
  useEffect(() => {
    if (activeEvent?.status === 'Active') {
      timerRef.current = setInterval(() => {
        setDisplaySeconds(elapsedSeconds() ?? 0)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      if (activeEvent?.status === 'Finished') {
        setDisplaySeconds(elapsedSeconds() ?? 0)
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [activeEvent?.status, elapsedSeconds])

  const handleCancel = async (reason: CancelReason) => {
    await cancelEvent(reason)
    setShowCancelModal(false)
  }

  if (!activeEvent) return null

  const isActive = activeEvent.status === 'Active'
  const isFinished = activeEvent.status === 'Finished'
  const isPending = activeEvent.status === 'Pending'
  const canCancel = isPending || isActive
  const canEnd = isFinished

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: '#0f172a',
      color: '#e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      gap: '24px',
      boxSizing: 'border-box',
    }}>

      {/* Route name */}
      <div>
        <p style={{ margin: 0, fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {activeEvent.route.name}
        </p>
      </div>

      {/* Status badge */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <EventStatusBadge status={activeEvent.status} />
      </div>

      {/* Elapsed time — only show once started */}
      {(isActive || isFinished) && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 64,
            fontWeight: 800,
            fontFamily: 'monospace',
            letterSpacing: '0.05em',
            color: isFinished ? '#60a5fa' : '#e2e8f0',
            lineHeight: 1,
          }}>
            {formatElapsed(displaySeconds)}
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#64748b' }}>
            {isFinished ? 'Final Time' : 'Elapsed Time'}
          </p>
        </div>
      )}

      {/* Pending hint */}
      {isPending && (
        <div style={{
          textAlign: 'center',
          padding: '16px',
          backgroundColor: '#1e293b',
          borderRadius: 8,
          border: '1px solid #334155',
        }}>
          <p style={{ margin: 0, fontSize: 14, color: '#94a3b8', lineHeight: 1.5 }}>
            Head to the start line. Your timer will start automatically when you cross it.
          </p>
        </div>
      )}

      {/* Start line crossed indicator */}
      {hasTriggeredStartLine && isActive && (
        <div style={{
          textAlign: 'center',
          padding: '10px',
          backgroundColor: '#022c22',
          borderRadius: 8,
          border: '1px solid #16a34a33',
        }}>
          <p style={{ margin: 0, fontSize: 13, color: '#34d399' }}>
            ✓ Start line crossed — you're racing!
          </p>
        </div>
      )}

      {/* Event code */}
      <EventCodeDisplay
        eventCode={activeEvent.eventCode}
        eventId={activeEvent.id}
      />

      {/* Error */}
      {error && (
        <p style={{
          margin: 0,
          padding: '10px 12px',
          backgroundColor: '#450a0a',
          border: '1px solid #991b1b',
          borderRadius: 6,
          fontSize: 13,
          color: '#fca5a5',
        }}>
          {error}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
        {canEnd && (
          <button
            onClick={endEvent}
            disabled={isEnding}
            style={{
              padding: '14px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: isEnding ? '#1e3a5f' : '#3b82f6',
              color: isEnding ? '#475569' : 'white',
              fontWeight: 700,
              fontSize: 16,
              cursor: isEnding ? 'not-allowed' : 'pointer',
            }}
          >
            {isEnding ? 'Ending...' : 'End Event'}
          </button>
        )}

        {canCancel && (
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={isEnding}
            style={{
              padding: '12px',
              borderRadius: 8,
              border: '1px solid #991b1b',
              backgroundColor: 'transparent',
              color: '#ef4444',
              fontWeight: 600,
              fontSize: 15,
              cursor: isEnding ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel Event
          </button>
        )}
      </div>

      {/* Cancel modal */}
      {showCancelModal && (
        <CancelEventModal
          onConfirm={handleCancel}
          onDismiss={() => setShowCancelModal(false)}
          isLoading={isEnding}
        />
      )}
    </div>
  )
}