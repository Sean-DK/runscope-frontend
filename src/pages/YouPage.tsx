import { useAuth } from '../features/auth/hooks/useAuth'
import { useAuthStore } from '../features/auth/store/authStore'
import { authApi } from '../features/auth/api'
import { UnitPreference } from '../features/auth/types'
import { C, F, screenPad } from '../shared/ds'
import { useEffect, useState } from 'react'
import { fetchClient } from '../shared/utils/fetchClient'

// ── Types ──────────────────────────────────────────────────
interface PersonalRecord {
  distance:    string
  timeSeconds: number
  updatedAt:   string
}

const DISTANCES: { key: string; label: string }[] = [
  { key: 'OneMile',      label: '1 Mile' },
  { key: 'FiveK',        label: '5K' },
  { key: 'FiveMile',     label: '5 Mile' },
  { key: 'TenK',         label: '10K' },
  { key: 'HalfMarathon', label: 'Half Marathon' },
  { key: 'Marathon',     label: 'Marathon' },
]

const fmtTime = (seconds: number): string => {
  const h   = Math.floor(seconds / 3600)
  const m   = Math.floor((seconds % 3600) / 60)
  const s   = seconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

// ── PR Keypad Modal ────────────────────────────────────────
const PrKeypadModal = ({
  label,
  initial,
  onSave,
  onDelete,
  onDismiss,
}: {
  distance:  string
  label:     string
  initial:   number | null
  onSave:    (seconds: number) => Promise<void>
  onDelete:  () => Promise<void>
  onDismiss: () => void
}) => {
  // Store digits right-to-left: [s1, s2, m1, m2, h1, h2]
  const [digits, setDigits] = useState<number[]>(
    initial
      ? (() => {
          const h = Math.floor(initial / 3600)
          const m = Math.floor((initial % 3600) / 60)
          const s = initial % 60
          return [s % 10, Math.floor(s / 10), m % 10, Math.floor(m / 10), h % 10, Math.floor(h / 10)]
        })()
      : [0, 0, 0, 0, 0, 0]
  )
  const [isSaving, setIsSaving] = useState(false)

  const pushDigit = (d: number) => {
    setDigits((prev) => {
      const next = [d, ...prev.slice(0, 5)]
      return next
    })
  }

  const backspace = () => {
    setDigits((prev) => [...prev.slice(1), 0])
  }

  // Convert digits array to display string HH:MM:SS
  const [s1, s2, m1, m2, h1, h2] = digits
  const displayH = `${h2}${h1}`
  const displayM = `${m2}${m1}`
  const displayS = `${s2}${s1}`

  const totalSeconds = (
    parseInt(displayH) * 3600 +
    parseInt(displayM) * 60 +
    parseInt(displayS)
  )

  const isValid = totalSeconds > 0

  const handleSave = async () => {
    if (!isValid) return
    setIsSaving(true)
    try {
      await onSave(totalSeconds)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsSaving(true)
    try {
      await onDelete()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{
      position:        'fixed',
      inset:           0,
      zIndex:          100,
      background:      'rgba(0,0,0,0.6)',
      display:         'flex',
      alignItems:      'flex-end',
      justifyContent:  'center',
    }} onClick={onDismiss}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width:           '100%',
          maxWidth:        480,
          background:      C.base,
          borderRadius:    '20px 20px 0 0',
          border:          `1px solid ${C.hairline}`,
          borderBottom:    'none',
          padding:         `24px ${screenPad}px 32px`,
          display:         'flex',
          flexDirection:   'column',
          gap:             20,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.textTertiary, margin: '0 0 4px' }}>
              Personal Record
            </p>
            <p style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: 0 }}>
              {label}
            </p>
          </div>
          <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: C.textTertiary, fontSize: 20, cursor: 'pointer', padding: 4 }}>
            ✕
          </button>
        </div>

        {/* Time display */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            4,
          padding:        '20px 0',
        }}>
          {[displayH, displayM, displayS].map((val, i) => (
            <>
              <div key={i} style={{
                display:        'flex',
                gap:            4,
              }}>
                {val.split('').map((d, j) => (
                  <div key={j} style={{
                    width:          52,
                    height:         64,
                    borderRadius:   12,
                    background:     C.elevated,
                    border:         `1.5px solid ${C.hairline}`,
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    fontFamily:     F.display,
                    fontSize:       32,
                    fontWeight:     700,
                    fontVariantNumeric: 'tabular-nums',
                    color:          d === '0' && val === (i === 0 ? displayH : i === 1 ? displayM : displayS) && digits.every(x => x === 0) ? C.textTertiary : C.textPrimary,
                  }}>
                    {d}
                  </div>
                ))}
              </div>
              {i < 2 && (
                <span key={`sep-${i}`} style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, color: C.textTertiary, marginBottom: 4 }}>:</span>
              )}
            </>
          ))}
        </div>

        {/* Keypad */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[[1,2,3],[4,5,6],[7,8,9],['del',0,'']].map((row, ri) => (
            <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {row.map((k, ki) => (
                <button
                  key={ki}
                  onClick={() => {
                    if (k === 'del') backspace()
                    else if (k !== '') pushDigit(Number(k))
                  }}
                  disabled={k === ''}
                  style={{
                    height:         56,
                    borderRadius:   12,
                    border:         k === '' ? 'none' : `1px solid ${C.hairline}`,
                    background:     k === '' ? 'transparent' : C.elevated,
                    color:          C.textPrimary,
                    fontFamily:     k === 'del' ? F.ui : F.display,
                    fontSize:       k === 'del' ? 13 : 22,
                    fontWeight:     k === 'del' ? 600 : 500,
                    cursor:         k === '' ? 'default' : 'pointer',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                  }}
                >
                  {k === 'del' ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                      <line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" />
                    </svg>
                  ) : k === '' ? null : k}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={handleSave}
            disabled={!isValid || isSaving}
            style={{
              padding:      '15px',
              borderRadius: 14,
              border:       'none',
              background:   !isValid || isSaving ? C.elevated : C.volt,
              color:        !isValid || isSaving ? C.textTertiary : C.base,
              fontFamily:   F.ui,
              fontSize:     15,
              fontWeight:   700,
              cursor:       !isValid || isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            {isSaving ? 'Saving...' : 'Save PR'}
          </button>
          {initial !== null && (
            <button
              onClick={handleDelete}
              disabled={isSaving}
              style={{
                padding:      '12px',
                borderRadius: 14,
                border:       'none',
                background:   'none',
                color:        C.red,
                fontFamily:   F.ui,
                fontSize:     13,
                fontWeight:   600,
                cursor:       'pointer',
              }}
            >
              Remove PR
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────
export const YouPage = () => {
  const { user, signOut } = useAuth()
  const setUser = useAuthStore((state) => state.setUser)
  const [prs, setPrs] = useState<PersonalRecord[]>([])
  const [editingDistance, setEditingDistance] = useState<{ key: string; label: string } | null>(null)

  useEffect(() => {
    fetchClient<PersonalRecord[]>('/api/users/me/prs').then(setPrs).catch(() => {})
  }, [])

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const handleToggleUnits = async () => {
    if (!user) return
    const newPreference: UnitPreference =
      user.unitPreference === 'Miles' ? 'Kilometers' : 'Miles'
    setUser({ ...user, unitPreference: newPreference })
    try {
      await authApi.updatePreferences(newPreference)
    } catch {
      setUser({ ...user, unitPreference: user.unitPreference })
    }
  }

  const handleSavePr = async (distance: string, timeSeconds: number) => {
    const updated = await fetchClient<PersonalRecord>(`/api/users/me/prs/${distance}`, {
      method: 'PUT',
      body:   { timeSeconds },
    })
    setPrs((prev) => {
      const existing = prev.findIndex((p) => p.distance === distance)
      if (existing >= 0) {
        const next = [...prev]
        next[existing] = updated
        return next
      }
      return [...prev, updated]
    })
    setEditingDistance(null)
  }

  const handleDeletePr = async (distance: string) => {
    await fetchClient(`/api/users/me/prs/${distance}`, { method: 'DELETE' })
    setPrs((prev) => prev.filter((p) => p.distance !== distance))
    setEditingDistance(null)
  }

  const getPr = (key: string) => prs.find((p) => p.distance === key) ?? null

  return (
    <div style={{
      flex:            1,
      display:         'flex',
      flexDirection:   'column',
      backgroundColor: C.base,
      overflowY:       'auto',
      padding:         `24px ${screenPad}px`,
      gap:             20,
    }}>

      {/* Page title */}
      <h1 style={{
        fontFamily:    F.display,
        fontSize:      26,
        fontWeight:    700,
        letterSpacing: '-.02em',
        color:         C.textPrimary,
        margin:        0,
      }}>
        You
      </h1>

      {/* Profile card */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          14,
        padding:      '16px',
        borderRadius: 18,
        background:   C.surface,
        border:       `1px solid ${C.hairline}`,
      }}>
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0 }}
          />
        ) : (
          <div style={{
            width:          52,
            height:         52,
            borderRadius:   '50%',
            background:     C.elevated,
            border:         `1px solid ${C.hairline}`,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontFamily:     F.display,
            fontSize:       18,
            fontWeight:     700,
            color:          C.textPrimary,
            flexShrink:     0,
          }}>
            {initials}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily:   F.display,
            fontSize:     17,
            fontWeight:   700,
            color:        C.textPrimary,
            whiteSpace:   'nowrap',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
          }}>
            {user?.name ?? '—'}
          </div>
          <div style={{
            fontFamily:   F.ui,
            fontSize:     13,
            color:        C.textSecondary,
            marginTop:    2,
            whiteSpace:   'nowrap',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
          }}>
            {user?.email ?? '—'}
          </div>
        </div>
      </div>

      {/* Preferences section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p style={{
          fontFamily:    F.ui,
          fontSize:      11,
          fontWeight:    700,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color:         C.textTertiary,
          margin:        '0 0 8px',
        }}>
          Preferences
        </p>

        <SettingRow
          label="Units"
          value={user?.unitPreference === 'Kilometers' ? 'Kilometers' : 'Miles'}
          onClick={handleToggleUnits}
          showChevron={false}
          trailing={
            <div style={{
              display:      'flex',
              borderRadius: 10,
              overflow:     'hidden',
              border:       `1px solid ${C.hairline}`,
            }}>
              {(['Miles', 'Kilometers'] as UnitPreference[]).map((opt) => {
                const active = (user?.unitPreference ?? 'Miles') === opt
                return (
                  <button
                    key={opt}
                    onClick={(e) => { e.stopPropagation(); if (!active) handleToggleUnits() }}
                    style={{
                      padding:    '5px 12px',
                      border:     'none',
                      background: active ? C.volt : C.elevated,
                      color:      active ? C.base : C.textSecondary,
                      fontFamily: F.ui,
                      fontSize:   12,
                      fontWeight: 600,
                      cursor:     active ? 'default' : 'pointer',
                    }}
                  >
                    {opt === 'Miles' ? 'mi' : 'km'}
                  </button>
                )
              })}
            </div>
          }
        />
      </div>

      {/* Personal Records section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p style={{
          fontFamily:    F.ui,
          fontSize:      11,
          fontWeight:    700,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color:         C.textTertiary,
          margin:        '0 0 8px',
        }}>
          Personal Records
        </p>

        {DISTANCES.map(({ key, label }) => {
          const pr = getPr(key)
          return (
            <SettingRow
              key={key}
              label={label}
              value={pr ? fmtTime(pr.timeSeconds) : '—'}
              onClick={() => setEditingDistance({ key, label })}
              showChevron={false}
              trailing={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily:         F.display,
                    fontSize:           15,
                    fontWeight:         600,
                    fontVariantNumeric: 'tabular-nums',
                    color:              pr ? C.volt : C.textTertiary,
                  }}>
                    {pr ? fmtTime(pr.timeSeconds) : '—'}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textTertiary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              }
            />
          )
        })}
      </div>

      {/* Account section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p style={{
          fontFamily:    F.ui,
          fontSize:      11,
          fontWeight:    700,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color:         C.textTertiary,
          margin:        '0 0 8px',
        }}>
          Account
        </p>

        <SettingRow
          label="Sign out"
          onClick={signOut}
          destructive
        />
      </div>

      {/* App info */}
      <div style={{ marginTop: 'auto', paddingTop: 24 }}>
        <p style={{
          fontFamily: F.ui,
          fontSize:   12,
          color:      C.textTertiary,
          margin:     0,
          textAlign:  'center',
          lineHeight: 1.6,
        }}>
          RunScope v{import.meta.env.VITE_APP_VERSION}
        </p>
      </div>

      {/* PR Keypad Modal */}
      {editingDistance && (
        <PrKeypadModal
          distance={editingDistance.key}
          label={editingDistance.label}
          initial={getPr(editingDistance.key)?.timeSeconds ?? null}
          onSave={(seconds) => handleSavePr(editingDistance.key, seconds)}
          onDelete={() => handleDeletePr(editingDistance.key)}
          onDismiss={() => setEditingDistance(null)}
        />
      )}
    </div>
  )
}

const SettingRow = ({
  label,
  value,
  onClick,
  destructive = false,
  showChevron = true,
  trailing,
}: {
  label:        string
  value?:       string
  onClick:      () => void
  destructive?: boolean
  showChevron?: boolean
  trailing?:    React.ReactNode
}) => (
  <button
    onClick={onClick}
    style={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      width:          '100%',
      padding:        '14px 16px',
      borderRadius:   14,
      border:         `1px solid ${C.hairline}`,
      background:     C.surface,
      cursor:         'pointer',
      textAlign:      'left',
      gap:            12,
    }}
  >
    <span style={{
      fontFamily: F.ui,
      fontSize:   15,
      fontWeight: 500,
      color:      destructive ? C.red : C.textPrimary,
      flex:       1,
    }}>
      {label}
    </span>
    {trailing ?? (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {value && (
          <span style={{ fontFamily: F.ui, fontSize: 14, color: C.textSecondary }}>
            {value}
          </span>
        )}
        {showChevron && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textTertiary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
      </div>
    )}
  </button>
)