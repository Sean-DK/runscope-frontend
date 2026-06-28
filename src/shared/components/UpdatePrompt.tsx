import { useState, useEffect } from 'react'
import { registerSW } from 'virtual:pwa-register'

export const UpdatePrompt = () => {
  const [needsRefresh, setNeedsRefresh] = useState(false)
  const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | null>(null)

  useEffect(() => {
    const update = registerSW({
      immediate: true,
      onNeedRefresh() {
        setNeedsRefresh(true)
      },
      onOfflineReady() {},
    })
    setUpdateSW(() => update)
  }, [])

  if (!needsRefresh) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      backgroundColor: '#1e1e2e',
      border: '1px solid #3b82f6',
      borderRadius: 12,
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 13, color: '#e2e8f0' }}>
        A new version of RunScope is available.
      </span>
      <button
        onClick={() => updateSW?.()}
        style={{
          padding: '6px 14px',
          borderRadius: 6,
          border: 'none',
          backgroundColor: '#3b82f6',
          color: 'white',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Update
      </button>
      <button
        onClick={() => setNeedsRefresh(false)}
        style={{
          background: 'none',
          border: 'none',
          color: '#64748b',
          fontSize: 18,
          cursor: 'pointer',
          lineHeight: 1,
          padding: '0 2px',
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  )
}