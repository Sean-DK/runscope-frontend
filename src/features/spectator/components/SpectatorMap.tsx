import { useCallback, useEffect, useRef } from 'react'
import Map, { Layer, MapRef, Marker, Source } from 'react-map-gl/mapbox'
import { Feature, LineString } from 'geojson'
import { useSpectatorStore } from '../store/spectatorStore'
import { RacerMarker } from './RacerMarker'
import { ConnectionStatusBar } from './ConnectionStatusBar'
import { Route } from '../../routes/types'
import 'mapbox-gl/dist/mapbox-gl.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string

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

// Finds the index in a flat coordinate array closest to the racer's position,
// then splits the array into traversed and remaining halves
const splitRouteAtPosition = (
  coords: [number, number][],
  racerPosition: [number, number]
): { traversed: [number, number][]; remaining: [number, number][] } => {
  if (coords.length === 0) return { traversed: [], remaining: coords }

  let closestIndex = 0
  let closestDist = Infinity

  coords.forEach(([lng, lat], i) => {
    const dLng = lng - racerPosition[0]
    const dLat = lat - racerPosition[1]
    const dist = dLng * dLng + dLat * dLat // squared distance, no need for sqrt
    if (dist < closestDist) {
      closestDist = dist
      closestIndex = i
    }
  })

  return {
    traversed: coords.slice(0, closestIndex + 1),
    remaining: coords.slice(closestIndex),
  }
}

export const SpectatorMap = () => {
  const mapRef = useRef<MapRef>(null)
  const {
    event,
    racerPosition,
    connectionStatus,
    mapMode,
    setMapMode,
  } = useSpectatorStore()

  const route = event?.route

  const allCoords = route?.segments.flatMap((s) => s.path as [number, number][]) ?? []

  const { traversed, remaining } = racerPosition
    ? splitRouteAtPosition(allCoords, racerPosition)
    : { traversed: [], remaining: allCoords }

  const traversedGeoJson: Feature<LineString> = {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: traversed },
    properties: {},
  }

  const remainingGeoJson: Feature<LineString> = {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: remaining },
    properties: {},
  }

  // Fit map to route on load
  const handleMapLoad = useCallback(() => {
    if (!route) return
    const bounds = getRouteBounds(route)
    if (bounds) mapRef.current?.fitBounds(bounds, { padding: 48, duration: 0 })
  }, [route])

  // Auto-follow racer when in follow mode
  useEffect(() => {
    if (mapMode !== 'follow' || !racerPosition || !mapRef.current) return
    mapRef.current.easeTo({
      center: racerPosition,
      zoom: 15,
      duration: 800,
    })
  }, [racerPosition, mapMode])

  // Fit full route when switching to overview mode
  useEffect(() => {
    if (mapMode !== 'overview' || !route) return
    const bounds = getRouteBounds(route)
    if (bounds) mapRef.current?.fitBounds(bounds, { padding: 48, duration: 600 })
  }, [mapMode, route])

  if (!route) return null

  const startCoords = route.waypoints[0]?.coordinates
  const finishCoords = route.waypoints[route.waypoints.length - 1]?.coordinates

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ConnectionStatusBar status={connectionStatus} />

      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{ longitude: 0, latitude: 0, zoom: 1 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onLoad={handleMapLoad}
      >
        {/* Traversed portion — grayed out */}
        {traversed.length > 1 && (
          <Source id="route-traversed" type="geojson" data={traversedGeoJson}>
            <Layer
              id="route-traversed-outline"
              type="line"
              paint={{ 'line-color': '#334155', 'line-width': 6, 'line-opacity': 0.6 }}
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
            />
            <Layer
              id="route-traversed-line"
              type="line"
              paint={{ 'line-color': '#64748b', 'line-width': 4, 'line-opacity': 0.9 }}
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
            />
          </Source>
        )}

        {/* Remaining portion — full blue */}
        {remaining.length > 1 && (
          <Source id="route-remaining" type="geojson" data={remainingGeoJson}>
            <Layer
              id="route-remaining-outline"
              type="line"
              paint={{ 'line-color': '#1d4ed8', 'line-width': 6, 'line-opacity': 0.4 }}
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
            />
            <Layer
              id="route-remaining-line"
              type="line"
              paint={{ 'line-color': '#3b82f6', 'line-width': 4, 'line-opacity': 0.9 }}
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
            />
          </Source>
        )}

        {/* Start marker */}
        {startCoords && (
          <Marker longitude={startCoords[0]} latitude={startCoords[1]}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: 11,
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}>
              S
            </div>
          </Marker>
        )}

        {/* Finish marker */}
        {finishCoords && (
          <Marker longitude={finishCoords[0]} latitude={finishCoords[1]}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: 11,
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}>
              F
            </div>
          </Marker>
        )}

        {/* Racer marker */}
        {racerPosition && <RacerMarker coordinates={racerPosition} />}
      </Map>

      {/* Map mode toggle */}
      <button
        onClick={() => setMapMode(mapMode === 'follow' ? 'overview' : 'follow')}
        style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          zIndex: 10,
          padding: '8px 12px',
          borderRadius: 8,
          border: 'none',
          backgroundColor: '#1e1e2e',
          color: '#e2e8f0',
          fontWeight: 600,
          fontSize: 12,
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
        }}
      >
        {mapMode === 'follow' ? '🗺 View Full Route' : '📍 Follow Racer'}
      </button>
    </div>
  )
}