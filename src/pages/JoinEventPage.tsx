import { useState } from 'react'
import { useJoinEvent } from '../features/spectator/hooks/useJoinEvent'

export const JoinEventPage = () => {
  const [code, setCode] = useState('')
  const { joinByCode, isJoining, error } = useJoinEvent()

  const handleSubmit = () => joinByCode(code)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: '#0f172a',
      color: '#e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 360,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800 }}>
            Join Event
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
            Enter the event code shared by your racer
          </p>
        </div>

        {/* Code input */}
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder="e.g. A3K9PX"
          maxLength={8}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          style={{
            padding: '14px 16px',
            borderRadius: 8,
            border: `1px solid ${error ? '#991b1b' : '#334155'}`,
            backgroundColor: '#1e1e2e',
            color: '#e2e8f0',
            fontSize: 24,
            fontWeight: 700,
            fontFamily: 'monospace',
            letterSpacing: '0.2em',
            textAlign: 'center',
            outline: 'none',
          }}
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
            textAlign: 'center',
          }}>
            {error}
          </p>
        )}

        {/* Join button */}
        <button
          onClick={handleSubmit}
          disabled={isJoining || !code.trim()}
          style={{
            padding: '14px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: isJoining || !code.trim() ? '#1e3a5f' : '#3b82f6',
            color: isJoining || !code.trim() ? '#475569' : 'white',
            fontWeight: 700,
            fontSize: 16,
            cursor: isJoining || !code.trim() ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.15s ease',
          }}
        >
          {isJoining ? 'Joining...' : 'Join Event'}
        </button>
      </div>
    </div>
  )
}