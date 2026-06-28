import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { RouteBuilderMap } from '../features/routes/components/RouteBuilderMap'
import { RouteBuilderSidebar } from '../features/routes/components/RouteBuilderSidebar'
import { useRouteBuilder } from '../features/routes/hooks/useRouteBuilder'
import { useRouteStore } from '../features/routes/store/routeStore'
import { useUnits } from '../shared/hooks/useUnits'
import { routesApi } from '../features/routes/api'
import { C, F } from '../shared/ds'

const mapOverlayBtn: React.CSSProperties = {
  width:           40,
  height:          40,
  borderRadius:    12,
  border:          `1px solid ${C.hairline}`,
  background:      'rgba(10,11,13,0.7)',
  backdropFilter:  'blur(8px)',
  color:           C.textPrimary,
  cursor:          'pointer',
  display:         'flex',
  alignItems:      'center',
  justifyContent:  'center',
}

export const RouteBuilderPage = () => {
  const [searchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const editId = searchParams.get('edit')
  const { initNew, initEdit, clearDraft } = useRouteBuilder()
  const store   = useRouteStore()
  const navigate = useNavigate()
  const { useMetric } = useUnits()

  const handleCancel = () => {
    if (store.isDirty) {
      const ok = window.confirm('You have unsaved changes. Discard them and leave?')
      if (!ok) return
    }
    navigate('/routes')
  }

  useEffect(() => {
    if (editId) {
      routesApi.getById(editId).then(initEdit).catch(() => initNew())
    } else {
      initNew()
    }
    return () => clearDraft()
  }, [editId])

  return (
    <div style={{ position: 'relative', height: '100dvh', width: '100vw', overflow: 'hidden' }}>
      {/* Map always fills the screen */}
      <RouteBuilderMap />

      {/* Left drawer */}
      <div style={{
        position:   'absolute',
        top:        0,
        left:       0,
        height:     '100%',
        zIndex:     20,
        transform:  sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s cubic-bezier(.4,0,.2,1)',
      }}>
        <RouteBuilderSidebar
          onClose={() => setSidebarOpen(false)}
          onCancel={handleCancel}
          useMetric={useMetric}
        />
      </div>

      {/* Floating top-left: back button + open drawer */}
      {!sidebarOpen && (
        <div style={{
          position: 'absolute', top: 14, left: 14, zIndex: 30,
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <button onClick={handleCancel} style={mapOverlayBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Route name chip */}
          <div style={{
            padding:       '9px 14px',
            borderRadius:  12,
            border:        `1px solid ${C.hairline}`,
            background:    'rgba(10,11,13,0.7)',
            backdropFilter: 'blur(8px)',
            fontFamily:    F.ui,
            fontSize:      14,
            fontWeight:    600,
            color:         store.draftRoute?.name ? C.textPrimary : C.textTertiary,
            display:       'flex',
            alignItems:    'center',
            gap:           6,
            cursor:        'pointer',
          }} onClick={() => setSidebarOpen(true)}>
            {store.draftRoute?.name || 'New route'}
            <span style={{ width: 2, height: 16, background: C.volt, borderRadius: 1, animation: 'rsBlink 1s infinite' }} />
          </div>
        </div>
      )}

      {/* Floating right: locate + undo */}
      <div style={{
        position: 'absolute', top: 14, right: 14, zIndex: 30,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {/* Locate (no-op placeholder) */}
        <button style={mapOverlayBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
        </button>
        {/* Undo — remove last waypoint */}
        <button style={mapOverlayBtn} onClick={() => {
          const wps = store.getOrderedWaypoints()
          if (wps.length > 0) store.removeWaypoint(wps[wps.length - 1].id)
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
          </svg>
        </button>
      </div>

      {/* Hamburger to open sidebar */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          style={{ ...mapOverlayBtn, position: 'absolute', top: 64, left: 14, zIndex: 30 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textPrimary} strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}
