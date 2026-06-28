import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'
import { routesApi } from '../features/routes/api'
import { eventsApi } from '../features/events/api'
import { AppHeader } from '../shared/components/AppHeader'
import { TabBar } from '../shared/components/TabBar'
import { C, F, screenPad } from '../shared/ds'

// ──────────────────────────────────────────────────────────
// Signed-out home
// ──────────────────────────────────────────────────────────
const SignedOutHome = () => {
  const navigate = useNavigate()
  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: C.base,
      display: 'flex',
      flexDirection: 'column',
      padding: `0 ${screenPad}px`,
    }}>
      <AppHeader />

      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 32 }}>
        <LivePill />
        <h1 style={{
          fontFamily: F.display,
          fontSize: 36,
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: '-.02em',
          color: C.textPrimary,
          margin: '16px 0 10px',
        }}>
          Share every mile,<br />the moment it happens.
        </h1>
        <p style={{ fontFamily: F.ui, fontSize: 15, color: C.textSecondary, margin: 0, lineHeight: 1.55 }}>
          Real-time race tracking for runners and the people cheering them on.
        </p>
      </div>

      {/* Choice cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 32 }}>
        <ChoiceCard
          eyebrow="For runners"
          title="I'm running"
          subtitle="Create routes, host events, and share your progress in real time."
          primary
          icon={<CircularArrowIcon color={C.base} />}
          onClick={() => navigate('/sign-in')}
        />
        <ChoiceCard
          eyebrow="For spectators"
          title="I'm spectating"
          subtitle="Follow a racer live with a 6-digit event code."
          primary={false}
          icon={<ArrowIcon color={C.volt} />}
          onClick={() => navigate('/join')}
        />

        <p style={{ textAlign: 'center', fontFamily: F.ui, fontSize: 13, color: C.textTertiary, margin: '8px 0 0' }}>
          Already have an account?{' '}
          <span
            onClick={() => navigate('/sign-in')}
            style={{ color: C.volt, fontWeight: 600, cursor: 'pointer' }}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Signed-in home
// ──────────────────────────────────────────────────────────
const SignedInHome = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [routeCount, setRouteCount] = useState<number | null>(null)
  const [eventCount, setEventCount] = useState<number | null>(null)

  useEffect(() => {
    routesApi.getAll().then((r) => setRouteCount(r.length)).catch(() => {})
    eventsApi.getPast().then((e) => setEventCount(e.length)).catch(() => {})
  }, [])

  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: C.base,
      overflow: 'auto',
    }}>
      {/* Greeting header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `20px ${screenPad}px 0`,
      }}>
        <div>
          <p style={{ fontFamily: F.ui, fontSize: 14, color: C.textSecondary, margin: '0 0 2px' }}>
            {greeting}
          </p>
          <h1 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, letterSpacing: '-.02em', color: C.textPrimary, margin: 0 }}>
            {firstName}
          </h1>
        </div>
        <div style={{
          width:           44,
          height:          44,
          borderRadius:    '50%',
          background:      C.elevated,
          border:          `1px solid ${C.hairline}`,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          fontFamily:      F.display,
          fontSize:        15,
          fontWeight:      700,
          color:           C.textPrimary,
          flexShrink:      0,
        }}>
          {initials}
        </div>
      </div>

      <div style={{ padding: `20px ${screenPad}px`, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Start a race CTA */}
        <button
          onClick={() => navigate('/routes')}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            10,
            width:          '100%',
            padding:        '16px',
            borderRadius:   18,
            border:         'none',
            background:     C.volt,
            color:          C.base,
            fontFamily:     F.ui,
            fontSize:       16,
            fontWeight:     700,
            cursor:         'pointer',
          }}
        >
          <PlayIcon />
          Start a race
        </button>

        {/* Stat cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <StatCard
            label="My routes"
            value={routeCount}
            icon={<RouteIcon />}
            onClick={() => navigate('/routes')}
          />
          <StatCard
            label="Past events"
            value={eventCount}
            icon={<EventIcon />}
            onClick={() => navigate('/events/past')}
          />
        </div>

        {/* Join an event */}
        <button
          onClick={() => navigate('/join')}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            width:          '100%',
            padding:        '16px 18px',
            borderRadius:   18,
            border:         `1px solid ${C.hairline}`,
            background:     C.surface,
            color:          C.textPrimary,
            fontFamily:     F.ui,
            fontSize:       15,
            fontWeight:     600,
            cursor:         'pointer',
            textAlign:      'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: C.elevated, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <JoinIcon />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Join an event</div>
              <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 1 }}>Enter a 6-digit code</div>
            </div>
          </div>
          <ChevronRight />
        </button>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Root component
// ──────────────────────────────────────────────────────────
export const HomePage = () => {
  const { isSignedIn } = useAuth()

  if (!isSignedIn) return <SignedOutHome />

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: C.base }}>
      <SignedInHome />
      <TabBar />
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────
const LivePill = () => (
  <span style={{
    display:       'inline-flex',
    alignItems:    'center',
    gap:           6,
    padding:       '5px 11px',
    borderRadius:  100,
    background:    'rgba(200,249,78,0.13)',
    color:         C.volt,
    fontFamily:    F.ui,
    fontSize:      12,
    fontWeight:    700,
    letterSpacing: '.04em',
  }}>
    <span style={{
      width: 6, height: 6, borderRadius: '50%', background: C.volt,
      animation: 'rsBlink 1.2s infinite',
    }} />
    LIVE
  </span>
)

const ChoiceCard = ({
  eyebrow, title, subtitle, primary, icon, onClick,
}: {
  eyebrow: string; title: string; subtitle: string
  primary: boolean; icon: React.ReactNode; onClick: () => void
}) => (
  <button
    onClick={onClick}
    style={{
      display:      'flex',
      alignItems:   'center',
      justifyContent: 'space-between',
      gap:          16,
      padding:      22,
      borderRadius: 22,
      border:       primary ? 'none' : `1px solid ${C.hairline}`,
      background:   primary ? C.volt : C.surface,
      color:        primary ? C.base : C.textPrimary,
      cursor:       'pointer',
      textAlign:    'left',
      width:        '100%',
    }}
  >
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', margin: '0 0 5px', color: primary ? 'rgba(10,11,13,.5)' : C.textTertiary }}>
        {eyebrow}
      </p>
      <p style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, letterSpacing: '-.01em', margin: '0 0 6px' }}>
        {title}
      </p>
      <p style={{ fontFamily: F.ui, fontSize: 13, lineHeight: 1.5, margin: 0, color: primary ? 'rgba(10,11,13,.65)' : C.textSecondary }}>
        {subtitle}
      </p>
    </div>
    <div style={{ flexShrink: 0 }}>{icon}</div>
  </button>
)

const StatCard = ({ label, value, icon, onClick }: { label: string; value: number | null; icon: React.ReactNode; onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      display:       'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height:        128,
      padding:       16,
      borderRadius:  18,
      border:        `1px solid ${C.hairline}`,
      background:    C.surface,
      cursor:        'pointer',
      textAlign:     'left',
    }}
  >
    <div style={{ color: C.textSecondary }}>{icon}</div>
    <div>
      <div style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, color: C.textPrimary, letterSpacing: '-.02em', lineHeight: 1 }}>
        {value ?? '—'}
      </div>
      <div style={{ fontFamily: F.ui, fontSize: 12, color: C.textSecondary, marginTop: 3 }}>
        {label}
      </div>
    </div>
  </button>
)

// ── Icons ──────────────────────────────────────────────────
const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={C.base}>
    <polygon points="5,3 19,12 5,21" />
  </svg>
)
const CircularArrowIcon = ({ color }: { color: string }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
)
const ArrowIcon = ({ color }: { color: string }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)
const RouteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" />
    <path d="M6 17V7a2 2 0 0 1 2-2h4" /><path d="M18 7v10a2 2 0 0 1-2 2H8" />
  </svg>
)
const EventIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)
const JoinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.volt} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h6v6" /><path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
)
const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textTertiary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)
