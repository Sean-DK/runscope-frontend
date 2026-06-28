import { useCallback } from "react"
import { Waypoint } from "../types"
import { useRouteStore } from "../store/routeStore"
import { useMapbox } from "./useMapbox"

const parseGpx = (xml: Document): [number, number][] => {
    const trkpts = xml.querySelectorAll('trkpt')

    // Use route points if no track points are found
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

const downsampleCoordinates = (
  coords: [number, number][],
  maxPoints: number = 100
): [number, number][] => {
  if (coords.length <= maxPoints) return coords
  const step = (coords.length - 1) / (maxPoints - 1)
  return Array.from({ length: maxPoints }, (_, i) =>
    coords[Math.round(i * step)]
  )
}

export const useGpxImport = () => {
  const { addWaypoint, setError } = useRouteStore()
  const { recalculateSegments } = useMapbox()

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

        const coords = downsampleCoordinates(rawCoords)

        const waypoints: Waypoint[] = coords.map((coordinates, i) => ({
          id: crypto.randomUUID(),
          coordinates,
          order: i,
        }))

        waypoints.forEach((wp) => addWaypoint(wp))
        recalculateSegments(waypoints)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse file.')
      }
    }

    reader.readAsText(file)
  }, [addWaypoint, recalculateSegments, setError])

  return { importFile }
}