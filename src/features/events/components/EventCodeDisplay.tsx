import { useRef, useState } from 'react'
import { C, F } from '../../../shared/ds'

interface EventCodeDisplayProps {
  eventCode: string
  eventId: string
  spectatorCount?: number
}

export const EventCodeDisplay = ({ eventCode, eventId, spectatorCount = 0 }: EventCodeDisplayProps) => {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const spectatorUrl = `${window.location.origin}/events/${eventId}/watch`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(spectatorUrl)
    } catch {
      const input = document.createElement('input')
      input.value = spectatorUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    setCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      background:    C.surface,
      border:        `1px solid ${C.hairline}`,
      borderRadius:  18,
      padding:       '20px 22px',
      display:       'flex',
      flexDirection: 'column',
      alignItems:    'center',
      gap:           6,
    }}>
      <p style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, letterSpacing: '.13em', textTransform: 'uppercase', color: C.textTertiary, margin: 0 }}>
        Event code
      </p>
      <div style={{ fontFamily: F.mono, fontSize: 40, fontWeight: 700, letterSpacing: '.22em', color: C.volt, margin: '4px 0' }}>
        {eventCode}
      </div>
      <p style={{ fontFamily: F.ui, fontSize: 12, color: C.textSecondary, margin: 0 }}>
        {spectatorCount} {spectatorCount === 1 ? 'spectator' : 'spectators'} watching
      </p>

      <button
        onClick={handleCopy}
        style={{
          marginTop:    8,
          padding:      '9px 18px',
          borderRadius: 100,
          border:       `1px solid ${copied ? C.volt : C.hairline}`,
          background:   copied ? 'rgba(200,249,78,0.1)' : C.elevated,
          color:        copied ? C.volt : C.textSecondary,
          fontFamily:   F.ui,
          fontSize:     13,
          fontWeight:   600,
          cursor:       'pointer',
          transition:   'all .15s',
        }}
      >
        {copied ? '✓ Link copied!' : 'Share link'}
      </button>
    </div>
  )
}
