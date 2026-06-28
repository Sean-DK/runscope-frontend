import { Route } from '../types'

// Sort segments by waypoint order and build a clean coordinate array.
// Segments from the API may come back in any order — this ensures the
// LineString follows the route sequentially without spaghetti connections.
export const getOrderedRouteCoordinates = (route: Route): [number, number][] => {
  const orderedWaypoints = [...route.waypoints].sort((a, b) => a.order - b.order)
  const coords: [number, number][] = []

  for (let i = 0; i < orderedWaypoints.length - 1; i++) {
    const fromId = orderedWaypoints[i].id
    const toId = orderedWaypoints[i + 1].id
    const segment = route.segments.find(
      (s) => s.fromWaypointId === fromId && s.toWaypointId === toId
    )
    if (segment) {
      // slice(1) on subsequent segments avoids duplicating the shared
      // junction point between adjacent segments
      const path = segment.path as [number, number][]
      coords.push(...(coords.length === 0 ? path : path.slice(1)))
    }
  }

  return coords
}