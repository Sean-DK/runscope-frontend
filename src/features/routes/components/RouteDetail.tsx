import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Map, { Layer, MapRef, Source } from 'react-map-gl/mapbox'
import { Feature, LineString } from 'geojson'
import { Route } from '../types'
import { useUnits } from '../../../shared/hooks/useUnits'
import { C, F } from '../../../shared/ds'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getOrderedRouteCoordinates } from '../utils/routeGeometry'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string

const fmtDist = (m: number, metric: boolean) =>
  metric ? `${(m / 1000).toFixed(1)} km` : `${(m / 1609.344).toFixed(1)} mi`

const estMin = (m: number) => Math.round(m / 1000 * 6)

const getBounds = (route: Route): [[number, number], [number, number]] | null => {
  if (!route.waypoints.length) return null
  const lngs = route.waypoints.map((w) => w.coordinates[0])
  const lats  = route.waypoints.map((w) => w.coordinates[1])
  return [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]]
}

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

interface Props { route: Route; onDelete: () => void; onShare: () => void; isDeleting: boolean }

export const RouteDetail = ({ route, onDelete, onShare, isDeleting }: Props) => {
  const navigate = useNavigate()
  const mapRef   = useRef<MapRef>(null)
  const { useMetric } = useUnits()

  const coords = getOrderedRouteCoordinates(route)
    console.log('waypoints:', route.waypoints)
    console.log('segments:', route.segments)
    console.log('coords:', coords)

  const geoJson: Feature<LineString> = {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: getOrderedRouteCoordinates(route) },
    properties: {},
  }

  const onLoad = () => {
    const bounds = getBounds(route)
    if (bounds && mapRef.current) mapRef.current.fitBounds(bounds, { padding: 56, duration: 0 })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', backgroundColor: C.base }}>

      {/* Map top (300px) with floating controls */}
      <div style={{ height: 300, flexShrink: 0, position: 'relative' }}>
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={{ longitude: 0, latitude: 0, zoom: 1 }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          interactive={false}
          onLoad={onLoad}
        >
          {geoJson.geometry.coordinates.length > 0 && (
            <Source id="route" type="geojson" data={geoJson}>
              {/* Glow layer */}
              <Layer id="route-glow" type="line"
                paint={{ 'line-color': C.volt, 'line-width': 13, 'line-opacity': 0.18 }}
                layout={{ 'line-join': 'round', 'line-cap': 'round' }} />
              {/* Crisp line */}
              <Layer id="route-line" type="line"
                paint={{ 'line-color': C.volt, 'line-width': 4.5, 'line-opacity': 0.95 }}
                layout={{ 'line-join': 'round', 'line-cap': 'round' }} />
            </Source>
          )}
        </Map>

        {/* Back button */}
        <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 10 }}>
          <button onClick={() => navigate('/routes')} style={mapOverlayBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        {/* Share button */}
        <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 10 }}>
          <button onClick={onShare} style={mapOverlayBtn}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        </div>
      </div>

      {/* Route info */}
      <div style={{ padding: '18px 22px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', color: C.textPrimary, margin: 0 }}>
            {route.name}
          </h1>
          <p style={{ fontFamily: F.ui, fontSize: 13, color: C.textSecondary, margin: '4px 0 0' }}>
            {route.waypoints.length} waypoints
          </p>
        </div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.textTertiary }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      </div>

      {/* 3-cell stat strip */}
      <div style={{
        display:   'flex',
        margin:    '16px 22px 0',
        background: C.surface,
        border:    `1px solid ${C.hairline}`,
        borderRadius: 16,
        overflow:  'hidden',
        flexShrink: 0,
      }}>
        <StatCell label="Distance" value={fmtDist(route.totalDistance, useMetric)} />
        <div style={{ width: 1, background: C.hairline, flexShrink: 0 }} />
        <StatCell label="Gain" value="—" />
        <div style={{ width: 1, background: C.hairline, flexShrink: 0 }} />
        <StatCell label="Est min" value={`${estMin(route.totalDistance)}`} />
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* CTAs */}
      <div style={{ padding: '16px 22px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={() => navigate(`/events/new?routeId=${route.id}`)}
          style={{
            display:        'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width:          '100%', padding: '15px', borderRadius: 16,
            border:         'none', background: C.volt, color: C.base,
            fontFamily:     F.ui, fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={C.base}><polygon points="5,3 19,12 5,21" /></svg>
          Start race
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          <SecondaryBtn onClick={() => navigate(`/route-builder?edit=${route.id}`)}>
            Edit route
          </SecondaryBtn>
          <SecondaryBtn onClick={onShare}>Share link</SecondaryBtn>
          <SecondaryBtn onClick={onDelete} danger disabled={isDeleting}>
            {isDeleting ? '...' : 'Delete'}
          </SecondaryBtn>
        </div>
      </div>
    </div>
  )
}

const StatCell = ({ label, value }: { label: string; value: string }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 8px', gap: 3 }}>
    <span style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.textTertiary }}>
      {label}
    </span>
    <span style={{ fontFamily: F.display, fontSize: 18, fontWeight: 700, color: C.textPrimary, letterSpacing: '-.01em' }}>
      {value}
    </span>
  </div>
)

const SecondaryBtn = ({ children, onClick, danger, disabled }: {
  children: React.ReactNode; onClick: () => void; danger?: boolean; disabled?: boolean
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      flex:         1,
      padding:      '11px 8px',
      borderRadius: 14,
      border:       `1px solid ${danger ? 'rgba(255,82,71,.3)' : C.hairline}`,
      background:   C.elevated,
      color:        danger ? C.red : C.textSecondary,
      fontFamily:   F.ui,
      fontSize:     13,
      fontWeight:   600,
      cursor:       disabled ? 'not-allowed' : 'pointer',
    }}
  >
    {children}
  </button>
)
