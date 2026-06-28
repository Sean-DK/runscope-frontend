import { useNavigate } from 'react-router-dom'
import { useJoinEvent } from '../features/spectator/hooks/useJoinEvent'
import { C, F, screenPad } from '../shared/ds'
import { useState } from 'react'

const MAX = 6

const keyRows = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['paste', '0', 'back'],
]

const keySub: Record<string, string> = {
  '2': 'ABC', '3': 'DEF', '4': 'GHI', '5': 'JKL', '6': 'MNO',
  '7': 'PQRS', '8': 'TUV', '9': 'WXYZ',
}

export const JoinEventPage = () => {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const { joinByCode, isJoining, error } = useJoinEvent()

  const handleKey = (k: string) => {
    if (k === 'back') {
      setCode((c) => c.slice(0, -1))
    } else if (k === 'paste') {
      navigator.clipboard?.readText().then((t) => {
        const clean = t.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, MAX)
        setCode(clean)
      }).catch(() => {})
    } else if (code.length < MAX) {
      setCode((c) => (c + k).toUpperCase())
    }
  }

  const ready = code.length === MAX
  const handleJoin = () => { if (ready) joinByCode(code) }

  return (
    <div style={{
      minHeight:      '100dvh',
      backgroundColor: C.base,
      display:        'flex',
      flexDirection:  'column',
      padding:        `0 ${screenPad}px`,
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
      <div style={{ textAlign: 'center', marginTop: 20, marginBottom: 24 }}>
        <h1 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: '0 0 8px', letterSpacing: '-.01em' }}>
          Enter event code
        </h1>
        <p style={{ fontFamily: F.ui, fontSize: 14, color: C.textSecondary, margin: 0, lineHeight: 1.5 }}>
          Ask your runner for their 6-character event code
        </p>
      </div>

      {/* 6 code boxes */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
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
                position:       'relative',
                transition:     'border-color .15s',
              }}
            >
              {filled ? (
                <span style={{ fontFamily: F.mono, fontSize: 24, fontWeight: 700, color: C.textPrimary }}>
                  {code[i]}
                </span>
              ) : active ? (
                <span style={{
                  display:   'inline-block',
                  width:     2,
                  height:    24,
                  background: C.volt,
                  borderRadius: 1,
                  animation: 'rsBlink 1s infinite',
                }} />
              ) : null}
            </div>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <p style={{ textAlign: 'center', fontFamily: F.ui, fontSize: 13, color: C.red, margin: '8px 0 0' }}>
          {error}
        </p>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Keypad */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {keyRows.map((row, ri) => (
          <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {row.map((k) => (
              <KeypadKey key={k} value={k} sub={keySub[k]} onPress={() => handleKey(k)} />
            ))}
          </div>
        ))}

        {/* Join button */}
        <button
          onClick={handleJoin}
          disabled={!ready || isJoining}
          style={{
            marginTop:      8,
            width:          '100%',
            padding:        '15px',
            borderRadius:   16,
            border:         'none',
            background:     ready && !isJoining ? C.volt : C.elevated,
            color:          ready && !isJoining ? C.base : C.textTertiary,
            fontFamily:     F.ui,
            fontSize:       15,
            fontWeight:     700,
            cursor:         ready && !isJoining ? 'pointer' : 'not-allowed',
            transition:     'background .2s, color .2s',
          }}
        >
          {isJoining ? 'Joining...' : 'Join event'}
        </button>
      </div>

      <div style={{ height: 'env(safe-area-inset-bottom, 16px)', minHeight: 16 }} />
    </div>
  )
}

const KeypadKey = ({ value, sub, onPress }: { value: string; sub?: string; onPress: () => void }) => {
  const isBack = value === 'back'
  const isPaste = value === 'paste'
  return (
    <button
      onClick={onPress}
      style={{
        height:         64,
        borderRadius:   14,
        border:         `1px solid ${C.hairline}`,
        background:     C.elevated,
        color:          C.textPrimary,
        fontFamily:     isBack || isPaste ? F.ui : F.display,
        fontSize:       isBack || isPaste ? 13 : 22,
        fontWeight:     isBack || isPaste ? 600 : 500,
        cursor:         'pointer',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            1,
      }}
    >
      {isBack ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
          <line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" />
        </svg>
      ) : isPaste ? (
        'Paste'
      ) : (
        <>
          <span>{value}</span>
          {sub && <span style={{ fontFamily: F.ui, fontSize: 9, fontWeight: 600, color: C.textTertiary, letterSpacing: '.08em' }}>{sub}</span>}
        </>
      )}
    </button>
  )
}
