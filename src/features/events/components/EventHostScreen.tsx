import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EventCodeDisplay } from './EventCodeDisplay'
import { CancelEventModal } from './CancelEventModal'
import { useEventHost } from '../hooks/useEventHost'
import { CancelReason } from '../types'
import { C, F, screenPad } from '../../../shared/ds'

const formatElapsed = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export const EventHostScreen = () => {
  const navigate = useNavigate()
  const {
    activeEvent,
    isEnding,
    error,
    elapsedSeconds,
    endEvent,
    cancelEvent,
  } = useEventHost()

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [displaySeconds, setDisplaySeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [activeEvent?.status, elapsedSeconds])

  const handleCancel = async (reason: CancelReason) => {
    await cancelEvent(reason)
    setShowCancelModal(false)
    navigate('/')
  }

  const handleEnd = async () => {
    await endEvent()
    navigate('/')
  }

  if (!activeEvent) return null

  const isActive   = activeEvent.status === 'Active'
  const isFinished = activeEvent.status === 'Finished'
  const isPending  = activeEvent.status === 'Pending'
  const canCancel  = isPending || isActive

  return (
    <div style={{
      minHeight:       '100dvh',
      backgroundColor: C.base,
      color:           C.textPrimary,
      display:         'flex',
      flexDirection:   'column',
      alignItems:      'center',
      padding:         `28px ${screenPad}px 32px`,
      boxSizing:       'border-box',
      gap:             20,
    }}>
      {/* LIVE badge */}
      <span style={{
        display:       'inline-flex',
        alignItems:    'center',
        gap:           6,
        padding:       '6px 14px',
        borderRadius:  100,
        background:    'rgba(200,249,78,0.13)',
        fontFamily:    F.ui,
        fontSize:      12,
        fontWeight:    700,
        color:         C.volt,
        letterSpacing: '.04em',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.volt, animation: 'rsBlink 1.2s infinite' }} />
        {isFinished ? 'FINISHED' : isActive ? 'LIVE' : 'PENDING'}
      </span>

      {/* Route name */}
      <p style={{ fontFamily: F.ui, fontSize: 14, color: C.textSecondary, margin: 0, textAlign: 'center' }}>
        {activeEvent.route.name}
      </p>

      {/* Big elapsed timer */}
      {(isActive || isFinished) && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily:         F.display,
            fontSize:           68,
            fontWeight:         700,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing:      '-.01em',
            color:              isFinished ? C.volt : C.textPrimary,
            lineHeight:         1,
          }}>
            {formatElapsed(displaySeconds)}
          </div>
          <p style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, letterSpacing: '.13em', textTransform: 'uppercase', color: C.textTertiary, margin: '10px 0 0' }}>
            {isFinished ? 'Final time' : 'Elapsed'}
          </p>
        </div>
      )}

      {/* Pending hint */}
      {isPending && (
        <div style={{
          background:   C.surface,
          border:       `1px solid ${C.hairline}`,
          borderRadius: 16,
          padding:      '18px 20px',
          textAlign:    'center',
          width:        '100%',
        }}>
          <p style={{ fontFamily: F.ui, fontSize: 14, color: C.textSecondary, lineHeight: 1.55, margin: 0 }}>
            Head to the start line. Your timer starts automatically when you cross it.
          </p>
        </div>
      )}

      {/* Event code card */}
      <div style={{ width: '100%' }}>
        <EventCodeDisplay
          eventCode={activeEvent.eventCode}
          eventId={activeEvent.id}
        />
      </div>

      {/* Stat cards — only while active */}
      {isActive && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
          <MiniStatCard label="KM so far" value="—" />
          <MiniStatCard label="Pace" value="—" />
        </div>
      )}

      {/* Error */}
      {error && (
        <p style={{ fontFamily: F.ui, fontSize: 13, color: C.red, textAlign: 'center', margin: 0 }}>
          {error}
        </p>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        {isFinished && (
          <button
            onClick={handleEnd}
            disabled={isEnding}
            style={{
              padding:      '15px',
              borderRadius: 16,
              border:       'none',
              background:   isEnding ? C.elevated : C.red,
              color:        isEnding ? C.textTertiary : '#fff',
              fontFamily:   F.ui,
              fontSize:     15,
              fontWeight:   700,
              cursor:       isEnding ? 'not-allowed' : 'pointer',
              width:        '100%',
            }}
          >
            {isEnding ? 'Saving...' : 'End race'}
          </button>
        )}

        {isActive && (
          <button
            style={{
              padding:      '14px',
              borderRadius: 16,
              border:       `1.5px solid ${C.amber}`,
              background:   'rgba(255,182,39,.08)',
              color:        C.amber,
              fontFamily:   F.ui,
              fontSize:     15,
              fontWeight:   700,
              cursor:       'pointer',
              width:        '100%',
            }}
          >
            Pause
          </button>
        )}

        {canCancel && (
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={isEnding}
            style={{
              background:     'none',
              border:         'none',
              color:          C.textTertiary,
              fontFamily:     F.ui,
              fontSize:       13,
              fontWeight:     600,
              cursor:         isEnding ? 'not-allowed' : 'pointer',
              padding:        '8px',
              textDecoration: 'underline',
            }}
          >
            Cancel event
          </button>
        )}
      </div>

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

const MiniStatCard = ({ label, value }: { label: string; value: string }) => (
  <div style={{
    background:   C.surface,
    border:       `1px solid ${C.hairline}`,
    borderRadius: 14,
    padding:      '14px 16px',
  }}>
    <p style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, letterSpacing: '.13em', textTransform: 'uppercase', color: C.textTertiary, margin: '0 0 6px' }}>
      {label}
    </p>
    <p style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: 0, letterSpacing: '-.01em' }}>
      {value}
    </p>
  </div>
)