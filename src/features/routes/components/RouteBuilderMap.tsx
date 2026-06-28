import { useCallback, useRef } from 'react'
import Map, { Layer, MapMouseEvent, MapRef, Source } from 'react-map-gl/mapbox'
import { Feature, LineString } from 'geojson'
import { useRouteBuilder } from '../hooks/useRouteBuilder'
import { WaypointMarker } from './WaypointMarker'
import { getOrderedRouteCoordinates } from '../utils/routeGeometry'
import 'mapbox-gl/dist/mapbox-gl.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string

const INITIAL_VIEW = {
  longitude: -98.5795,
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

  const handleMapLoad = useCallback(() => {
    // If editing an existing route with waypoints, fit the map to the route bounds
    if (draftRoute?.id && draftRoute.waypoints.length > 0) {
      const lngs = draftRoute.waypoints.map((wp) => wp.coordinates[0])
      const lats = draftRoute.waypoints.map((wp) => wp.coordinates[1])
      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ]
      mapRef.current?.fitBounds(bounds, { padding: 64, duration: 0 })
      return
    }

    // New route — fly to user's current location
    navigator.geolocation.getCurrentPosition((pos) => {
      mapRef.current?.flyTo({
        center: [pos.coords.longitude, pos.coords.latitude],
        zoom: 13,
        duration: 1500,
      })
    })
  }, [draftRoute?.id, draftRoute?.waypoints])

  const handleClick = useCallback((e: MapMouseEvent) => {
    if ((e.originalEvent.target as HTMLElement).closest('.mapboxgl-marker')) return
    handleMapClick([e.lngLat.lng, e.lngLat.lat])
  }, [handleMapClick])

  const routeGeoJson: Feature<LineString> = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: draftRoute ? getOrderedRouteCoordinates(draftRoute) : [],
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
      {routeGeoJson.geometry.coordinates.length > 0 && (
        <Source id="route" type="geojson" data={routeGeoJson}>
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