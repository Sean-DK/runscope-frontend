import { useLocation, useNavigate } from 'react-router-dom'
import { C, F } from '../ds'

const IconHome = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? C.volt : C.textTertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
)

const IconRoutes = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? C.volt : C.textTertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="2" />
    <circle cx="18" cy="5" r="2" />
    <path d="M6 17V7a2 2 0 0 1 2-2h4" />
    <path d="M18 7v10a2 2 0 0 1-2 2H8" />
  </svg>
)

const IconEvents = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? C.volt : C.textTertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const IconYou = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? C.volt : C.textTertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
)

const tabs = [
  { label: 'Home',   path: '/',            icon: IconHome },
  { label: 'Routes', path: '/routes',      icon: IconRoutes },
  { label: 'Events', path: '/events/past', icon: IconEvents },
  { label: 'You',    path: '/you',         icon: IconYou },
]

export const TabBar = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const active = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div style={{
      height:          80,
      background:      '#0C0D10',
      borderTop:       `1px solid ${C.hairline}`,
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'space-around',
      flexShrink:      0,
      paddingBottom:   'env(safe-area-inset-bottom)',
    }}>
      {/* Home */}
      <TabItem label={tabs[0].label} active={active(tabs[0].path)} onClick={() => navigate(tabs[0].path)}>
        <IconHome active={active(tabs[0].path)} />
      </TabItem>

      {/* Routes */}
      <TabItem label={tabs[1].label} active={active(tabs[1].path)} onClick={() => navigate(tabs[1].path)}>
        <IconRoutes active={active(tabs[1].path)} />
      </TabItem>

      {/* Center FAB */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button
          onClick={() => navigate('/route-builder')}
          style={{
            width:        52,
            height:       52,
            borderRadius: 16,
            border:       'none',
            background:   C.volt,
            color:        C.base,
            fontSize:     26,
            fontWeight:   300,
            cursor:       'pointer',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            marginTop:    -20,
            boxShadow:    `0 0 20px rgba(200,249,78,0.35)`,
            lineHeight:   1,
          }}
        >
          +
        </button>
      </div>

      {/* Events */}
      <TabItem label={tabs[2].label} active={active(tabs[2].path)} onClick={() => navigate(tabs[2].path)}>
        <IconEvents active={active(tabs[2].path)} />
      </TabItem>

      {/* You */}
      <TabItem label={tabs[3].label} active={active(tabs[3].path)} onClick={() => navigate(tabs[3].path)}>
        <IconYou active={active(tabs[3].path)} />
      </TabItem>
    </div>
  )
}

const TabItem = ({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) => (
  <button
    onClick={onClick}
    style={{
      display:         'flex',
      flexDirection:   'column',
      alignItems:      'center',
      gap:             3,
      background:      'none',
      border:          'none',
      cursor:          'pointer',
      padding:         '4px 10px',
      minWidth:        52,
    }}
  >
    {children}
    <span style={{
      fontFamily:    F.ui,
      fontSize:      10,
      fontWeight:    600,
      color:         active ? C.volt : C.textTertiary,
      letterSpacing: '.01em',
    }}>
      {label}
    </span>
  </button>
)
