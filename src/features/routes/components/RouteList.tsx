import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRouteStore } from '../store/routeStore'
import { useUnits } from '../../../shared/hooks/useUnits'
import { routesApi } from '../api'
import { Route } from '../types'
import { C, F, screenPad, btnVolt } from '../../../shared/ds'

const formatDistance = (meters: number, useMetric: boolean): string => {
  if (useMetric) return `${(meters / 1000).toFixed(1)} km`
  return `${(meters / 1609.344).toFixed(1)} mi`
}

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

// Mini SVG polyline thumbnail for a route
const RouteThumbnail = ({ waypoints }: { waypoints: Array<{ coordinates: [number, number] }> }) => {
  if (!waypoints || waypoints.length < 2) {
    return (
      <div style={{ width: 50, height: 50, borderRadius: 10, background: C.elevated, border: `1px solid ${C.hairline}`, flexShrink: 0 }} />
    )
  }

  const lngs = waypoints.map((w) => w.coordinates[0])
  const lats  = waypoints.map((w) => w.coordinates[1])
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
  const pad = 6
  const size = 50

  const toX = (lng: number) =>
    maxLng === minLng ? size / 2 : pad + ((lng - minLng) / (maxLng - minLng)) * (size - pad * 2)
  const toY = (lat: number) =>
    maxLat === minLat ? size / 2 : size - pad - ((lat - minLat) / (maxLat - minLat)) * (size - pad * 2)

  const pts = waypoints.map((w) => `${toX(w.coordinates[0])},${toY(w.coordinates[1])}`).join(' ')

  return (
    <div style={{ width: 50, height: 50, borderRadius: 10, background: C.mapBase, border: `1px solid ${C.hairline}`, flexShrink: 0, overflow: 'hidden' }}>
      <svg width="50" height="50" viewBox="0 0 50 50">
        <polyline points={pts} fill="none" stroke={C.volt} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity=".9" />
        {waypoints[0] && (
          <circle cx={toX(waypoints[0].coordinates[0])} cy={toY(waypoints[0].coordinates[1])} r="3" fill={C.textPrimary} />
        )}
      </svg>
    </div>
  )
}

export const RouteList = () => {
  const navigate = useNavigate()
  const { routes, isLoadingRoutes, setRoutes, setLoadingRoutes } = useRouteStore()
  const { useMetric } = useUnits()

  useEffect(() => {
    setLoadingRoutes(true)
    routesApi.getAll()
      .then(setRoutes)
      .catch(() => {})
      .finally(() => setLoadingRoutes(false))
  }, [])

  if (isLoadingRoutes) {
    return (
      <div style={centerStyle}>
        <p style={{ fontFamily: F.ui, color: C.textSecondary }}>Loading routes...</p>
      </div>
    )
  }

  if (routes.length === 0) {
    return (
      <div style={{ ...centerStyle, gap: 16 }}>
        <p style={{ fontFamily: F.ui, fontSize: 14, color: C.textSecondary }}>No routes yet.</p>
        <button onClick={() => navigate('/route-builder')} style={{ ...btnVolt, width: 'auto', padding: '12px 24px' }}>
          Create your first route
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: `0 ${screenPad}px` }}>
      {routes.map((route, i) => (
        <RouteRow
          key={route.id}
          route={route}
          isLast={i === routes.length - 1}
          useMetric={useMetric}
          onClick={() => navigate(`/routes/${route.id}`)}
        />
      ))}
    </div>
  )
}

const RouteRow = ({ route, isLast, useMetric, onClick }: {
  route: Route; isLast: boolean; useMetric: boolean; onClick: () => void
}) => (
  <div
    onClick={onClick}
    style={{
      display:       'flex',
      alignItems:    'center',
      gap:           14,
      padding:       '14px 0',
      borderBottom:  isLast ? 'none' : `1px solid ${C.hairline}`,
      cursor:        'pointer',
    }}
  >
    <RouteThumbnail waypoints={route.waypoints ?? []} />

    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: C.textPrimary, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {route.name}
      </div>
      <div style={{ fontFamily: F.ui, fontSize: 12, color: C.textSecondary }}>
        {formatDistance(route.totalDistance, useMetric)}
        {route.waypoints?.length ? ` · ${route.waypoints.length} waypoints` : ''}
      </div>
    </div>

    <div style={{ textAlign: 'right', flexShrink: 0 }}>
      <div style={{ fontFamily: F.ui, fontSize: 11, color: C.textTertiary }}>
        {formatDate(route.updatedAt)}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textTertiary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 4 }}>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  </div>
)

const centerStyle: React.CSSProperties = {
  display:        'flex',
  flexDirection:  'column',
  alignItems:     'center',
  justifyContent: 'center',
  padding:        '48px 24px',
}
