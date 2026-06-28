import { useRef, useState } from 'react'

interface EventCodeDisplayProps {
  eventCode: string
  eventId: string
}

export const EventCodeDisplay = ({ eventCode, eventId }: EventCodeDisplayProps) => {
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
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      padding: '20px',
      backgroundColor: '#0f172a',
      borderRadius: 12,
      border: '1px solid #1e293b',
    }}>
      <p style={{ margin: 0, fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Event Code
      </p>
      <div style={{
        fontSize: 40,
        fontWeight: 800,
        letterSpacing: '0.2em',
        color: '#e2e8f0',
        fontFamily: 'monospace',
      }}>
        {eventCode}
      </div>
      <button
        onClick={handleCopy}
        style={{
          padding: '8px 16px',
          borderRadius: 6,
          border: `1px solid ${copied ? '#22c55e' : '#334155'}`,
          backgroundColor: copied ? '#052e16' : 'transparent',
          color: copied ? '#86efac' : '#94a3b8',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          width: '100%',
        }}
      >
        {copied ? '✓ Spectator Link Copied!' : 'Copy Spectator Link'}
      </button>
    </div>
  )
}