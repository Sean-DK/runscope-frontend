import { useNavigate } from 'react-router-dom'
import { C, F } from '../ds'

export const RunScopeLogo = () => (
  <div
    style={{
      position:  'relative',
      width:     30,
      height:    30,
      borderRadius: '50%',
      border:    `2.5px solid ${C.volt}`,
      display:   'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.volt }} />
    <div style={{
      position:  'absolute',
      top:       -5,
      left:      '50%',
      transform: 'translateX(-50%)',
      width:     2,
      height:    5,
      background: C.volt,
    }} />
    <div style={{
      position:  'absolute',
      bottom:    -5,
      left:      '50%',
      transform: 'translateX(-50%)',
      width:     2,
      height:    5,
      background: C.volt,
    }} />
  </div>
)

export const AppHeader = () => {
  const navigate = useNavigate()

  return (
    <div style={{
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'space-between',
      padding:         '16px 22px',
      flexShrink:      0,
    }}>
      <div
        onClick={() => navigate('/')}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
      >
        <RunScopeLogo />
        <span style={{ fontFamily: F.display, fontWeight: 700, fontSize: 20, letterSpacing: '-.02em', color: C.textPrimary }}>
          RunScope
        </span>
      </div>

      <button
        style={{
          width:           32,
          height:          32,
          borderRadius:    '50%',
          border:          `1px solid ${C.hairline}`,
          background:      C.elevated,
          color:           C.textSecondary,
          fontSize:        15,
          fontWeight:      700,
          cursor:          'pointer',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
        }}
      >
        ?
      </button>
    </div>
  )
}
