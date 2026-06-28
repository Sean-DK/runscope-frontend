import { useAuth } from '../features/auth/hooks/useAuth'
import { useAuthStore } from '../features/auth/store/authStore'
import { authApi } from '../features/auth/api'
import { UnitPreference } from '../features/auth/types'
import { C, F, screenPad } from '../shared/ds'

export const YouPage = () => {
  const { user, signOut } = useAuth()
  const setUser = useAuthStore((state) => state.setUser)

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
        {/* Avatar */}
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
          fontFamily:  F.ui,
          fontSize:    12,
          color:       C.textTertiary,
          margin:      0,
          textAlign:   'center',
          lineHeight:  1.6,
        }}>
          RunScope v{import.meta.env.VITE_APP_VERSION}
        </p>
      </div>
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
  label: string
  value?: string
  onClick: () => void
  destructive?: boolean
  showChevron?: boolean
  trailing?: React.ReactNode
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