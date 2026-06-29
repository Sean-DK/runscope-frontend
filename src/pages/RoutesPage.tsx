import { useNavigate } from 'react-router-dom'
import { RouteList } from '../features/routes/components/RouteList'
import { C, F, screenPad } from '../shared/ds'

export const RoutesPage = () => {
  const navigate = useNavigate()

  return (
    <div style={{
      flex:            1,
      display:         'flex',
      flexDirection:   'column',
      backgroundColor: C.base,
      overflow:        'hidden',
      minHeight:       0,
    }}>

      {/* Page header — fixed */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        `20px ${screenPad}px 14px`,
        flexShrink:     0,
      }}>
        <h1 style={{
          fontFamily:    F.display,
          fontSize:      28,
          fontWeight:    700,
          letterSpacing: '-.02em',
          color:         C.textPrimary,
          margin:        0,
        }}>
          My routes
        </h1>
        <button
          onClick={() => navigate('/route-builder')}
          style={{
            width:          36,
            height:         36,
            borderRadius:   '50%',
            border:         'none',
            background:     C.volt,
            color:          C.base,
            fontSize:       22,
            fontWeight:     300,
            cursor:         'pointer',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            lineHeight:     1,
          }}
        >
          +
        </button>
      </div>

      {/* Search pill — fixed */}
      <div style={{ padding: `0 ${screenPad}px 14px`, flexShrink: 0 }}>
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:          8,
          padding:      '10px 14px',
          borderRadius: 100,
          background:   C.elevated,
          border:       `1px solid ${C.hairline}`,
          color:        C.textTertiary,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textTertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span style={{ fontFamily: F.ui, fontSize: 14, color: C.textTertiary }}>Search routes</span>
        </div>
      </div>

      {/* List — scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <RouteList />
      </div>
    </div>
  )
}