import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Map, { Layer, MapRef, Source } from 'react-map-gl/mapbox'
import { Feature, LineString } from 'geojson'
import { Route } from '../types'
import { routesApi } from '../api'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getOrderedRouteCoordinates } from '../utils/routeGeometry'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string

const formatDistance = (meters: number): string => {
  const miles = meters / 1609.344
  return `${miles.toFixed(2)} mi`
}

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

interface SharedRouteDetailProps {
  route: Route
  isSignedIn: boolean
}

export const SharedRouteDetail = ({ route, isSignedIn }: SharedRouteDetailProps) => {
  const navigate = useNavigate()
  const mapRef = useRef<MapRef>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const routeGeoJson: Feature<LineString> = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: getOrderedRouteCoordinates(route),
    },
    properties: {},
  }

  const handleMapLoad = () => {
    const bounds = getRouteBounds(route)
    if (!bounds || !mapRef.current) return
    mapRef.current.fitBounds(bounds, { padding: 48, duration: 0 })
  }

  const handleSave = async () => {
    if (!isSignedIn) {
      navigate('/sign-in')
      return
    }
    setIsSaving(true)
    try {
      // TODO: replace with real API call once backend is ready
      await routesApi.saveShared(route.id)
      setSaved(true)
    } catch {
      // Error handling to be added
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100dvh',
      backgroundColor: '#0f172a',
      color: '#e2e8f0',
    }}>

      {/* Header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid #1e293b',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          Shared Route
        </div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
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
            <Source id="shared-route-preview" type="geojson" data={routeGeoJson}>
              <Layer
                id="shared-route-outline"
                type="line"
                paint={{ 'line-color': '#1d4ed8', 'line-width': 6, 'line-opacity': 0.4 }}
                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              />
              <Layer
                id="shared-route-line"
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
        borderBottom: '1px solid #1e293b',
        flexShrink: 0,
      }}>
        <StatCell label="Distance" value={formatDistance(route.totalDistance)} />
        <StatCell label="Waypoints" value={`${route.waypoints.length}`} />
      </div>

      {/* Save action */}
      <div style={{ padding: '20px 16px', flexShrink: 0 }}>
        <button
          onClick={handleSave}
          disabled={isSaving || saved}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: saved ? '#166534' : isSignedIn ? '#3b82f6' : '#1e3a5f',
            color: saved ? '#86efac' : isSignedIn ? 'white' : '#93c5fd',
            fontWeight: 700,
            fontSize: 16,
            cursor: isSaving || saved ? 'default' : 'pointer',
            transition: 'background-color 0.2s ease',
          }}
        >
          {saved ? '✓ Saved to My Routes' : isSaving ? 'Saving...' : 'Save to My Routes'}
        </button>

        {!isSignedIn && (
          <p style={{
            margin: '8px 0 0',
            textAlign: 'center',
            fontSize: 13,
            color: '#64748b',
          }}>
            <span
              onClick={() => navigate('/sign-in')}
              style={{ color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Sign in
            </span>
            {' '}to save this route to your account
          </p>
        )}
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