import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRouteStore } from '../store/routeStore'
import { routesApi } from '../api'
import { Route } from '../types'

const formatDistance = (meters: number): string => {
  const miles = meters / 1609.344
  return `${miles.toFixed(2)} mi`
}

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

export const RouteList = () => {
  const navigate = useNavigate()
  const { routes, isLoadingRoutes, setRoutes, setLoadingRoutes } = useRouteStore()

  useEffect(() => {
    setLoadingRoutes(true)
    routesApi.getAll()
      .then(setRoutes)
      .catch(() => {}) // error handling can be added later
      .finally(() => setLoadingRoutes(false))
  }, [])

  if (isLoadingRoutes) {
    return (
      <div style={centerStyle}>
        <p style={{ color: '#94a3b8' }}>Loading routes...</p>
      </div>
    )
  }

  if (routes.length === 0) {
    return (
      <div style={centerStyle}>
        <p style={{ color: '#94a3b8', marginBottom: 16 }}>No routes yet.</p>
        <button
          onClick={() => navigate('/route-builder')}
          style={primaryButtonStyle}
        >
          Create Your First Route
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {routes.map((route, i) => (
        <RouteRow
          key={route.id}
          route={route}
          isLast={i === routes.length - 1}
          onClick={() => navigate(`/routes/${route.id}`)}
        />
      ))}
    </div>
  )
}

const RouteRow = ({
  route,
  isLast,
  onClick,
}: {
  route: Route
  isLast: boolean
  onClick: () => void
}) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 16px',
      borderBottom: isLast ? 'none' : '1px solid #1e293b',
      cursor: 'pointer',
      transition: 'background-color 0.15s ease',
      backgroundColor: 'transparent',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0f172a')}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0' }}>
        {route.name}
      </span>
      <span style={{ fontSize: 12, color: '#64748b' }}>
        {formatDate(route.updatedAt)}
      </span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 14, color: '#94a3b8' }}>
          {formatDistance(route.totalDistance)}
        </div>
        <div style={{ fontSize: 12, color: '#64748b' }}>
          {route.waypoints.length} waypoints
        </div>
      </div>
      <span style={{ color: '#475569', fontSize: 18 }}>›</span>
    </div>
  </div>
)

// --- Styles ---

const centerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px 24px',
}

const primaryButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: 6,
  border: 'none',
  backgroundColor: '#3b82f6',
  color: 'white',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
}