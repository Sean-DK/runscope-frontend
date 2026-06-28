import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { useAuthStore } from '../../features/auth/store/authStore'
import { authApi } from '../../features/auth/api'
import { UnitPreference } from '../../features/auth/types'

export const AppHeader = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const setUser = useAuthStore((state) => state.setUser)

  const handleToggleUnits = async () => {
    if (!user) return
    const newPreference: UnitPreference =
      user.unitPreference === 'Miles' ? 'Kilometers' : 'Miles'

    // Optimistically update the store immediately for instant UI response
    setUser({ ...user, unitPreference: newPreference })

    try {
      await authApi.updatePreferences(newPreference)
    } catch {
      // Revert on failure
      setUser({ ...user, unitPreference: user.unitPreference })
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      backgroundColor: '#1e1e2e',
      borderBottom: '1px solid #1e293b',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <span
        onClick={() => navigate('/')}
        style={{
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: '#e2e8f0',
          cursor: 'pointer',
        }}
      >
        RunScope
      </span>

      {/* Right side controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* Units toggle */}
        {user && (
          <button
            onClick={handleToggleUnits}
            title="Toggle units"
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              border: '1px solid #334155',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'border-color 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6'
              e.currentTarget.style.color = '#e2e8f0'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#334155'
              e.currentTarget.style.color = '#94a3b8'
            }}
          >
            {user.unitPreference === 'Miles' ? 'mi' : 'km'}
          </button>
        )}

        {/* Sign out */}
        <button
          onClick={signOut}
          style={{
            padding: '5px 10px',
            borderRadius: 6,
            border: '1px solid #334155',
            backgroundColor: 'transparent',
            color: '#64748b',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}