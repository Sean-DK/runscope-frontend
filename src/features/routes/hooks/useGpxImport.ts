import { useCallback } from "react"
import { Waypoint, RouteSegment } from "../types"
import { useRouteStore } from "../store/routeStore"

const WAYPOINTS_PER_MILE = 10
const METERS_PER_MILE = 1609.344
const MIN_WAYPOINTS = 10
const MAX_WAYPOINTS = 500

const parseGpx = (xml: Document): [number, number][] => {
  const trkpts = xml.querySelectorAll('trkpt')
  const points = trkpts.length > 0 ? trkpts : xml.querySelectorAll('rtept')
  return Array.from(points).map((pt) => [
    parseFloat(pt.getAttribute('lon') ?? '0'),
    parseFloat(pt.getAttribute('lat') ?? '0'),
  ])
}

const parseKml = (xml: Document): [number, number][] => {
  const coordsEl = xml.querySelector('coordinates')
  if (!coordsEl?.textContent) return []
  return coordsEl.textContent
    .trim()
    .split(/\s+/)
    .map((coord) => {
      const [lng, lat] = coord.split(',').map(Number)
      return [lng, lat] as [number, number]
    })
    .filter(([lng, lat]) => !isNaN(lng) && !isNaN(lat))
}

const calculateTotalDistance = (coords: [number, number][]): number =>
  coords.slice(0, -1).reduce(
    (sum, coord, i) => sum + haversineDistance(coord, coords[i + 1]),
    0
  )

const getDynamicMaxPoints = (coords: [number, number][]): number => {
  const totalMeters = calculateTotalDistance(coords)
  const totalMiles = totalMeters / METERS_PER_MILE
  const points = Math.round(totalMiles * WAYPOINTS_PER_MILE)
  return Math.min(Math.max(points, MIN_WAYPOINTS), MAX_WAYPOINTS)
}

const downsampleCoordinates = (
  coords: [number, number][],
  maxPoints: number
): { downsampled: [number, number][]; indices: number[] } => {
  if (coords.length <= maxPoints) {
    return {
      downsampled: coords,
      indices: coords.map((_, i) => i),
    }
  }
  const step = (coords.length - 1) / (maxPoints - 1)
  const indices = Array.from({ length: maxPoints }, (_, i) =>
    Math.round(i * step)
  )
  return {
    downsampled: indices.map((idx) => coords[idx]),
    indices,
  }
}

const haversineDistance = (
  [lng1, lat1]: [number, number],
  [lng2, lat2]: [number, number]
): number => {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const calculatePathDistance = (path: [number, number][]): number =>
  path.slice(0, -1).reduce(
    (sum, coord, i) => sum + haversineDistance(coord, path[i + 1]),
    0
  )

// Build segments directly from raw GPS coordinates, slicing the full
// coordinate array between each pair of downsampled waypoint indices.
// This preserves offroad paths exactly as recorded in the GPX/KML file.
const buildRawSegments = (
  rawCoords: [number, number][],
  waypoints: Waypoint[],
  waypointIndices: number[]
): RouteSegment[] => {
  return waypoints.slice(0, -1).map((wp, i) => {
    const fromIndex = waypointIndices[i]
    const toIndex = waypointIndices[i + 1]
    const path = rawCoords.slice(fromIndex, toIndex + 1)
    return {
      fromWaypointId: wp.id,
      toWaypointId: waypoints[i + 1].id,
      path,
      distance: calculatePathDistance(path),
    }
  })
}

export const useGpxImport = () => {
  const { addWaypoint, setSegments, setError } = useRouteStore()

  const importFile = useCallback((file: File) => {
    const isGpx = file.name.endsWith('.gpx')
    const isKml = file.name.endsWith('.kml')

    if (!isGpx && !isKml) {
      setError('Only .gpx and .kml files are supported.')
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const parser = new DOMParser()
        const xml = parser.parseFromString(text, 'application/xml')

        const parseError = xml.querySelector('parsererror')
        if (parseError) throw new Error('Invalid file format')

        const rawCoords = isGpx ? parseGpx(xml) : parseKml(xml)
        if (rawCoords.length < 2) throw new Error('File contains fewer than 2 points')

        const maxPoints = getDynamicMaxPoints(rawCoords)
        const { downsampled, indices } = downsampleCoordinates(rawCoords, maxPoints)

        const waypoints: Waypoint[] = downsampled.map((coordinates, i) => ({
          id: crypto.randomUUID(),
          coordinates,
          order: i,
        }))

        // Add waypoints to store
        waypoints.forEach((wp) => addWaypoint(wp))

        // Build segments from raw GPS coords — no Mapbox snapping
        const segments = buildRawSegments(rawCoords, waypoints, indices)
        setSegments(segments)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse file.')
      }
    }

    reader.readAsText(file)
  }, [addWaypoint, setSegments, setError])

  return { importFile }
}