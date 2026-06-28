import { useCallback, useRef } from 'react'
import Map, { Layer, MapMouseEvent, MapRef, Source } from 'react-map-gl/mapbox'
import { useRouteBuilder } from '../hooks/useRouteBuilder'
import { WaypointMarker } from './WaypointMarker'
import 'mapbox-gl/dist/mapbox-gl.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string

const INITIAL_VIEW = {
  longitude: -98.5795,  // center of US — will relocate to user on mount
  latitude: 39.8283,
  zoom: 4,
}

export const RouteBuilderMap = () => {
  const mapRef = useRef<MapRef>(null)
  const {
    draftRoute,
    orderedWaypoints,
    selectedWaypointId,
    handleMapClick,
    handleWaypointDragEnd,
    setSelectedWaypoint,
  } = useRouteBuilder()

  // Fly to user's location on first load
  const handleMapLoad = useCallback(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      mapRef.current?.flyTo({
        center: [pos.coords.longitude, pos.coords.latitude],
        zoom: 13,
        duration: 1500,
      })
    })
  }, [])

  const handleClick = useCallback((e: MapMouseEvent) => {
    // Ignore clicks on markers (they have their own handlers)
    if ((e.originalEvent.target as HTMLElement).closest('.mapboxgl-marker')) return
    handleMapClick([e.lngLat.lng, e.lngLat.lat])
  }, [handleMapClick])

  // Build GeoJSON from all segment paths
  const routeGeoJson: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: draftRoute?.segments.flatMap((seg) => seg.path) ?? [],
    },
    properties: {},
  }

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={INITIAL_VIEW}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      onClick={handleClick}
      onLoad={handleMapLoad}
    >
      {/* Route line */}
      {routeGeoJson.geometry.coordinates.length > 0 && (
        <Source id="route" type="geojson" data={routeGeoJson}>
          {/* Outline for contrast */}
          <Layer
            id="route-outline"
            type="line"
            paint={{
              'line-color': '#1d4ed8',
              'line-width': 6,
              'line-opacity': 0.4,
            }}
            layout={{ 'line-join': 'round', 'line-cap': 'round' }}
          />
          {/* Main route line */}
          <Layer
            id="route-line"
            type="line"
            paint={{
              'line-color': '#3b82f6',
              'line-width': 4,
              'line-opacity': 0.9,
            }}
            layout={{ 'line-join': 'round', 'line-cap': 'round' }}
          />
        </Source>
      )}

      {/* Waypoint markers */}
      {orderedWaypoints.map((wp, i) => (
        <WaypointMarker
          key={wp.id}
          waypoint={wp}
          index={i}
          totalCount={orderedWaypoints.length}
          isSelected={selectedWaypointId === wp.id}
          onSelect={setSelectedWaypoint}
          onDragEnd={handleWaypointDragEnd}
        />
      ))}
    </Map>
  )
}