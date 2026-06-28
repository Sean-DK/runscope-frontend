import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'

const isIos = () =>
  /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())

const isInStandaloneMode = () =>
  'standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone

export const HomePage = () => {
  const navigate = useNavigate()
  const { isSignedIn, user, signOut } = useAuth()

  const showIosInstallHint = isIos() && !isInStandaloneMode()

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: '#0f172a',
      color: '#e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 16px',
      boxSizing: 'border-box',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 24,
        paddingBottom: 8,
        flexShrink: 0,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
            RunScope
          </h1>
            {isSignedIn && user?.name && (
              <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>
                Hey, {user.name}
              </p>
            )}
        </div>
        {isSignedIn && (
          <button
            onClick={signOut}
            style={{
              background: 'none',
              border: '1px solid #334155',
              borderRadius: 6,
              color: '#64748b',
              fontSize: 13,
              padding: '6px 12px',
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        )}
      </div>

      {/* iOS install hint */}
      {showIosInstallHint && (
        <div style={{
          margin: '12px 0',
          padding: '12px 14px',
          backgroundColor: '#1e3a5f',
          borderRadius: 8,
          border: '1px solid #1d4ed833',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>📲</span>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: '#93c5fd' }}>
              Running a race? Install RunScope first.
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#60a5fa', lineHeight: 1.5 }}>
              Tap the Share button in Safari, then "Add to Home Screen" to enable background GPS tracking during your race.
            </p>
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 12,
        paddingBottom: 40,
      }}>
        {!isSignedIn ? (
          <>
            {/* Signed out state */}
            <p style={{
              margin: '0 0 8px',
              fontSize: 15,
              color: '#64748b',
              textAlign: 'center',
            }}>
              Who are you here as?
            </p>

            <ActionCard
              icon="🏃"
              title="I'm a Runner"
              description="Sign in to create routes and host events"
              onClick={() => navigate('/sign-in')}
              primary
            />

            <ActionCard
              icon="👀"
              title="I'm a Spectator"
              description="Join an event with a code to track your racer"
              onClick={() => navigate('/join')}
            />
          </>
        ) : (
          <>
            {/* Signed in state */}
            <ActionCard
              icon="🗺️"
              title="My Routes"
              description="View, create, and manage your race routes"
              onClick={() => navigate('/routes')}
              primary
            />

            <ActionCard
              icon="📋"
              title="Past Events"
              description="Review your previous race events"
              onClick={() => navigate('/events/past')}
            />

            <ActionCard
              icon="👀"
              title="Join Event"
              description="Join a friend's event as a spectator"
              onClick={() => navigate('/join')}
            />
          </>
        )}
      </div>
    </div>
  )
}

interface ActionCardProps {
  icon: string
  title: string
  description: string
  onClick: () => void
  primary?: boolean
}

const ActionCard = ({
  icon,
  title,
  description,
  onClick,
  primary = false,
}: ActionCardProps) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '16px',
      borderRadius: 12,
      border: `1px solid ${primary ? '#1d4ed8' : '#1e293b'}`,
      backgroundColor: primary ? '#1e3a5f' : '#1e1e2e',
      color: '#e2e8f0',
      cursor: 'pointer',
      textAlign: 'left',
      width: '100%',
      transition: 'border-color 0.15s ease, background-color 0.15s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = primary ? '#3b82f6' : '#334155'
      e.currentTarget.style.backgroundColor = primary ? '#1e4070' : '#252535'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = primary ? '#1d4ed8' : '#1e293b'
      e.currentTarget.style.backgroundColor = primary ? '#1e3a5f' : '#1e1e2e'
    }}
  >
    <span style={{ fontSize: 28, flexShrink: 0 }}>{icon}</span>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.4 }}>{description}</div>
    </div>
    <span style={{ color: '#334155', fontSize: 20, flexShrink: 0 }}>›</span>
  </button>
)