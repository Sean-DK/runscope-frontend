import { useNavigate } from 'react-router-dom'
import { useJoinEvent } from '../features/spectator/hooks/useJoinEvent'
import { C, F, screenPad } from '../shared/ds'
import { useRef, useState } from 'react'

const MAX = 6

export const JoinEventPage = () => {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const { joinByCode, isJoining, error } = useJoinEvent()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, MAX)
    setCode(clean)
  }

  const ready = code.length === MAX
  const handleJoin = () => { if (ready) joinByCode(code) }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && ready) handleJoin()
  }

  return (
    <div style={{
      minHeight:       '100dvh',
      backgroundColor: C.base,
      display:         'flex',
      flexDirection:   'column',
      padding:         `0 ${screenPad}px`,
    }}>
      {/* Back row */}
      <div style={{ paddingTop: 16 }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: C.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: F.ui, fontSize: 14, padding: '4px 0' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
      </div>

      {/* Icon badge */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 28 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20,
          background: C.elevated, border: `1px solid ${C.hairline}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={C.volt} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      {/* Heading */}
      <div style={{ textAlign: 'center', marginTop: 20, marginBottom: 32 }}>
        <h1 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: '0 0 8px', letterSpacing: '-.01em' }}>
          Enter event code
        </h1>
        <p style={{ fontFamily: F.ui, fontSize: 14, color: C.textSecondary, margin: 0, lineHeight: 1.5 }}>
          Ask your runner for their 6-character event code
        </p>
      </div>

      {/* 6 code boxes — tapping them focuses the hidden input */}
      <div
        style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 8, cursor: 'text' }}
        onClick={() => inputRef.current?.focus()}
      >
        {Array.from({ length: MAX }).map((_, i) => {
          const filled = i < code.length
          const active = i === code.length && code.length < MAX
          return (
            <div
              key={i}
              style={{
                width:          44,
                height:         56,
                borderRadius:   12,
                border:         `1.5px solid ${active ? C.volt : filled ? C.hairline : 'rgba(255,255,255,0.06)'}`,
                background:     filled || active ? C.surface : C.elevated,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                transition:     'border-color .15s',
              }}
            >
              {filled ? (
                <span style={{ fontFamily: F.mono, fontSize: 24, fontWeight: 700, color: C.textPrimary }}>
                  {code[i]}
                </span>
              ) : active ? (
                <span style={{
                  display:      'inline-block',
                  width:        2,
                  height:       24,
                  background:   C.volt,
                  borderRadius: 1,
                  animation:    'rsBlink 1s infinite',
                }} />
              ) : null}
            </div>
          )
        })}
      </div>

      {/* Hidden input — captures keyboard input and drives the code boxes */}
      <input
        ref={inputRef}
        value={code}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        maxLength={MAX}
        autoCapitalize="characters"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        style={{
          position: 'absolute',
          opacity:  0,
          width:    1,
          height:   1,
          pointerEvents: 'none',
        }}
      />

      {/* Error */}
      {error && (
        <p style={{ textAlign: 'center', fontFamily: F.ui, fontSize: 13, color: C.red, margin: '8px 0 0' }}>
          {error}
        </p>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Join button */}
      <div style={{ marginBottom: 12 }}>
        <button
          onClick={handleJoin}
          disabled={!ready || isJoining}
          style={{
            width:        '100%',
            padding:      '15px',
            borderRadius: 16,
            border:       'none',
            background:   ready && !isJoining ? C.volt : C.elevated,
            color:        ready && !isJoining ? C.base : C.textTertiary,
            fontFamily:   F.ui,
            fontSize:     15,
            fontWeight:   700,
            cursor:       ready && !isJoining ? 'pointer' : 'not-allowed',
            transition:   'background .2s, color .2s',
          }}
        >
          {isJoining ? 'Joining...' : 'Join event'}
        </button>
      </div>

      <div style={{ height: 'env(safe-area-inset-bottom, 16px)', minHeight: 16 }} />
    </div>
  )
}