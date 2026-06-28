import { useRegisterSW } from 'virtual:pwa-register/react'
import { C, F } from '../ds'

export const UpdatePrompt = () => {
  const {
    needRefresh:        [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegistered(r) {
      // Poll every 60 s so a freshly deployed build is detected quickly
      r && setInterval(() => r.update(), 60_000)
    },
  })

  if (!needRefresh) return null

  const apply = () => {
    // sendMessage SKIP_WAITING; the workbox 'controlling' listener reloads automatically.
    // The setTimeout is a belt-and-suspenders fallback for hosts that skip the SW message.
    updateServiceWorker(false)
    setTimeout(() => window.location.reload(), 400)
  }

  return (
    <div style={{
      position:        'fixed',
      bottom:          24,
      left:            '50%',
      transform:       'translateX(-50%)',
      zIndex:          9999,
      backgroundColor: C.elevated,
      border:          `1px solid ${C.volt}`,
      borderRadius:    14,
      boxShadow:       '0 4px 24px rgba(0,0,0,0.6)',
      padding:         '12px 16px',
      display:         'flex',
      alignItems:      'center',
      gap:             12,
      whiteSpace:      'nowrap',
    }}>
      <span style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 500, color: C.textPrimary }}>
        New version available
      </span>
      <button onClick={apply} style={{
        padding:         '6px 14px',
        borderRadius:    8,
        border:          'none',
        backgroundColor: C.volt,
        color:           C.base,
        fontFamily:      F.ui,
        fontWeight:      700,
        fontSize:        13,
        cursor:          'pointer',
        flexShrink:      0,
      }}>
        Update
      </button>
      <button onClick={() => setNeedRefresh(false)} style={{
        background:  'none',
        border:      'none',
        color:       C.textTertiary,
        fontSize:    18,
        cursor:      'pointer',
        lineHeight:  1,
        padding:     '0 2px',
        flexShrink:  0,
      }}>
        ✕
      </button>
    </div>
  )
}
