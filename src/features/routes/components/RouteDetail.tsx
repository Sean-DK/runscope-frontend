import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Map, { Layer, MapRef, Source } from 'react-map-gl/mapbox'
import { Feature, LineString } from 'geojson'
import { Route } from '../types'
import { useUnits } from '../../../shared/hooks/useUnits'
import 'mapbox-gl/dist/mapbox-gl.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string

const formatDistance = (meters: number, useMetric: boolean): string => {
  if (useMetric) {
    const km = meters / 1000
    return `${km.toFixed(2)} km`
  }
  const miles = meters / 1609.344
  return `${miles.toFixed(2)} mi`
}

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const getRouteBounds = (
  route: Route
): [[number, number], [number, number]] | null => {
  if (route.waypoints.length === 0) return null
  const lngs = route.waypoints.map((wp) => wp.coordinates[0])
  const lats = route.waypoints.map((wp) => wp.coordinates[1])
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ]
}

interface RouteDetailProps {
  route: Route
  onDelete: () => void
  onShare: () => void
  isDeleting: boolean
}

export const RouteDetail = ({ route, onDelete, onShare, isDeleting }: RouteDetailProps) => {
  const navigate = useNavigate()
  const mapRef = useRef<MapRef>(null)
  const { useMetric } = useUnits()

  const routeGeoJson: Feature<LineString> = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: route.segments.flatMap((seg) => seg.path),
    },
    properties: {},
  }

  const handleMapLoad = () => {
    const bounds = getRouteBounds(route)
    if (!bounds || !mapRef.current) return
    mapRef.current.fitBounds(bounds, { padding: 48, duration: 0 })
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#1e1e2e',
      color: '#e2e8f0',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        borderBottom: '1px solid #1e293b',
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/routes')}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: 22,
            cursor: 'pointer',
            lineHeight: 1,
            padding: 0,
            flexShrink: 0,
          }}
          title="Back to routes"
        >
          ‹
        </button>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, flex: 1 }}>
          {route.name}
        </h1>
      </div>

      {/* Map preview */}
      <div style={{ height: 280, flexShrink: 0 }}>
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={{ longitude: 0, latitude: 0, zoom: 1 }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          interactive={false}
          onLoad={handleMapLoad}
        >
          {routeGeoJson.geometry.coordinates.length > 0 && (
            <Source id="route-preview" type="geojson" data={routeGeoJson}>
              <Layer
                id="route-preview-outline"
                type="line"
                paint={{ 'line-color': '#1d4ed8', 'line-width': 6, 'line-opacity': 0.4 }}
                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              />
              <Layer
                id="route-preview-line"
                type="line"
                paint={{ 'line-color': '#3b82f6', 'line-width': 4, 'line-opacity': 0.9 }}
                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              />
            </Source>
          )}
        </Map>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: 0,
        borderBottom: '1px solid #1e293b',
        flexShrink: 0,
      }}>
        <StatCell label="Distance" value={formatDistance(route.totalDistance, useMetric)} />
        <StatCell label="Waypoints" value={`${route.waypoints.length}`} />
        <StatCell label="Last Updated" value={formatDate(route.updatedAt)} />
      </div>

      {/* Start Event button */}
      <div style={{ padding: '20px 16px 0', flexShrink: 0 }}>
        <button
          onClick={() => navigate(`/events/new?routeId=${route.id}`)}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: '#22c55e',
            color: 'white',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          Start Event
        </button>
      </div>

      {/* Secondary actions */}
      <div style={{
        display: 'flex',
        gap: 8,
        padding: '12px 16px',
        flexShrink: 0,
      }}>
        <button
          onClick={onShare}
          style={secondaryButtonStyle}
        >
          Share
        </button>
        <button
          onClick={() => navigate(`/route-builder?edit=${route.id}`)}
          style={secondaryButtonStyle}
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          style={dangerButtonStyle(isDeleting)}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  )
}

const StatCell = ({ label, value }: { label: string; value: string }) => (
  <div style={{
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '14px 8px',
    borderRight: '1px solid #1e293b',
    gap: 3,
  }}>
    <span style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>{value}</span>
    <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </span>
  </div>
)

// --- Styles ---

const secondaryButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px',
  borderRadius: 6,
  border: '1px solid #334155',
  backgroundColor: 'transparent',
  color: '#94a3b8',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
}

const dangerButtonStyle = (disabled: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '10px',
  borderRadius: 6,
  border: '1px solid #991b1b',
  backgroundColor: 'transparent',
  color: disabled ? '#475569' : '#ef4444',
  fontWeight: 600,
  fontSize: 14,
  cursor: disabled ? 'not-allowed' : 'pointer',
})