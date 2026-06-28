import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { RouteBuilderMap } from '../features/routes/components/RouteBuilderMap'
import { RouteBuilderSidebar } from '../features/routes/components/RouteBuilderSidebar'
import { useRouteBuilder } from '../features/routes/hooks/useRouteBuilder'
import { useRouteStore } from '../features/routes/store/routeStore'
import { useUnits } from '../shared/hooks/useUnits'
import { routesApi } from '../features/routes/api'

const formatDistance = (meters: number, useMetric: boolean): string => {
  if (useMetric) {
    const km = meters / 1000
    return `${km.toFixed(2)} km`
  }
  const miles = meters / 1609.344
  return `${miles.toFixed(2)} mi`
}

export const RouteBuilderPage = () => {
  const [searchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const editId = searchParams.get('edit')
  const { initNew, initEdit, clearDraft } = useRouteBuilder()
  const store = useRouteStore()
  const navigate = useNavigate()
  const { useMetric } = useUnits()

  const totalDistance = store.draftRoute?.totalDistance ?? 0

  const handleCancel = () => {
    if (store.isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Discard them and leave?'
      )
      if (!confirmed) return
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

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 10,
          }}
        />
      )}

      {/* Sidebar drawer */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        zIndex: 20,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
      }}>
        <RouteBuilderSidebar
          onClose={() => setSidebarOpen(false)}
          onCancel={handleCancel}
          useMetric={useMetric}
        />
      </div>

      {/* Toggle button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 30,
            width: 40,
            height: 40,
            borderRadius: 8,
            border: 'none',
            backgroundColor: '#1e1e2e',
            color: '#e2e8f0',
            fontSize: 20,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          }}
          title="Open route panel"
        >
          ☰
        </button>
      )}

      {/* Distance pill — only shown when sidebar is closed and route has distance */}
      {!sidebarOpen && totalDistance > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          backgroundColor: '#1e1e2e',
          color: '#e2e8f0',
          padding: '8px 16px',
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 700,
          fontFamily: 'monospace',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          border: '1px solid #334155',
          whiteSpace: 'nowrap',
          pointerEvents: 'none', // don't block map interaction
        }}>
          {formatDistance(totalDistance, useMetric)}
        </div>
      )}
    </div>
  )
}