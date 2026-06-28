import { useCallback, useRef } from "react"
import { RouteSegment, Waypoint } from "../types"
import { useRouteStore } from "../store/routeStore"

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string
const DIRECTIONS_BASE = 'https://api.mapbox.com/directions/v5/mapbox/walking'

interface DirectionsResponse {
    routes: Array<{
        geometry: {
            coordinates: [number, number][]
        }
        distance: number
    }>
}

const fetchSegment = async (
    from: Waypoint,
    to: Waypoint
): Promise<RouteSegment> => {
    const coords = `${from.coordinates[0]},${from.coordinates[1]};${to.coordinates[0]},${to.coordinates[1]}`
    const url = `${DIRECTIONS_BASE}/${coords}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`

    const res = await fetch(url)
    if (!res.ok) throw new Error('Mapbox Directions API request failed')

    const data: DirectionsResponse = await res.json()
    const route = data.routes[0]
    if (!route) throw new Error('No route found between waypoints')
    
    return {
        fromWaypointId: from.id,
        toWaypointId: to.id,
        path: route.geometry.coordinates,
        distance: route.distance,
    }
}

export const useMapbox = () => {
    const { draftRoute, setSegments, setError } = useRouteStore()

    // Ref to abort in-flight requests when new ones come in (e.g. rapid dragging)
    const abortControllerRef = useRef<AbortController | null>(null)

    const recalculateSegments = useCallback(async (waypoints: Waypoint[]) => {
        if (waypoints.length < 2) {
            setSegments([])
            return
        }

        // Cancel any in-flight requests
        abortControllerRef.current?.abort()
        abortControllerRef.current = new AbortController()

        try {
            const segmentPromises = waypoints.slice(0, -1).map((wp, i) =>
                fetchSegment(wp, waypoints[i + 1])
            )
            const segments = await Promise.all(segmentPromises)
            setSegments(segments)
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') return
            setError('Failed to calculate route. Check your waypoints and try again')
        }
    }, [setSegments, setError])

    const recalculateAdjacentSegments = useCallback(async (
        movedWaypointId: string,
        waypoints: Waypoint[]
    ) => {
        if (!draftRoute) return

        const index = waypoints.findIndex((wp) => wp.id === movedWaypointId)
        if (index === -1) return

        abortControllerRef.current?.abort()
        abortControllerRef.current = new AbortController()

        try {
            const updates: RouteSegment[] = []

            if (index > 0)
                updates.push(await fetchSegment(waypoints[index - 1], waypoints[index]))
            if (index < waypoints.length - 1)
                updates.push(await fetchSegment(waypoints[index], waypoints[index + 1]))

            const updatedSegments = draftRoute.segments.map((seg) => {
                const update = updates.find(
                    (u) =>
                        u.fromWaypointId === seg.fromWaypointId &&
                        u.toWaypointId === seg.toWaypointId
                )
                return update ?? seg
            })

            setSegments(updatedSegments)
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') return
            setError('Failed to recalculate route segment')
        }
    }, [draftRoute, setSegments, setError])

    return { recalculateSegments, recalculateAdjacentSegments }
}