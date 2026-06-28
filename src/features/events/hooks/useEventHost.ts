import { useCallback, useEffect, useRef } from 'react'
import { useEventStore } from '../store/eventStore'
import { useGeolocation } from './useGeolocation'
import { useGeofence } from './useGeofence'
import { useOfflineBuffer } from './useOfflineBuffer'
import { eventsApi } from '../api'
import { CancelReason, EventLocation } from '../types'
import { Route } from '../../routes/types'

// Calculate distance traveled along the route using the segment paths
const calculateDistanceAlongRoute = (
  position: [number, number],
  route: Route
): number => {
  // For now, return straight-line distance from route start
  // TODO: replace with proper route projection once backend is ready
  const start = route.waypoints[0]?.coordinates
  if (!start) return 0
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(position[1] - start[1])
  const dLng = toRad(position[0] - start[0])
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(start[1])) *
    Math.cos(toRad(position[1])) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Rolling 1-mile window pace calculation
const MILE_IN_METERS = 1609.344

interface PaceTracker {
  timestamp: number
  distanceFromStart: number
}

export const useEventHost = () => {
  const store = useEventStore()
  const paceHistoryRef = useRef<PaceTracker[]>([])

  const offlineBuffer = useOfflineBuffer(store.activeEvent?.id ?? '')

  // Flush buffer when coming back online
  useEffect(() => {
    const handleOnline = () => offlineBuffer.flushBuffer()
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [offlineBuffer])

  const startLineCoords = store.activeEvent?.route.waypoints[0]?.coordinates
  const finishLineCoords = store.activeEvent?.route.waypoints[
    (store.activeEvent?.route.waypoints.length ?? 1) - 1
  ]?.coordinates

  const startGeofence = useGeofence({
    center: startLineCoords ?? [0, 0],
    radiusMeters: 40,
    onEnter: useCallback(() => {
      if (!store.activeEvent || store.hasTriggeredStartLine) return
      const timestamp = new Date().toISOString()
      store.setStartedAt(timestamp)
      store.setHasTriggeredStartLine(true)
      paceHistoryRef.current = []

      // Vibrate on start line crossing
      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200])

      eventsApi.updateStatus(store.activeEvent.id, 'Active', { startedAt: timestamp })
    }, [store]),
  })

  const finishGeofence = useGeofence({
    center: finishLineCoords ?? [0, 0],
    radiusMeters: 40,
    onEnter: useCallback(() => {
      if (!store.activeEvent || store.hasTriggeredFinishLine) return
      if (store.activeEvent.status !== 'Active') return
      const timestamp = new Date().toISOString()
      store.setFinishedAt(timestamp)
      store.setHasTriggeredFinishLine(true)

      if ('vibrate' in navigator) navigator.vibrate([300, 100, 300, 100, 500])

      eventsApi.updateStatus(store.activeEvent.id, 'Finished', { finishedAt: timestamp })
    }, [store]),
  })

  const handlePosition = useCallback(async (coords: GeolocationCoordinates) => {
    const { activeEvent } = store
    if (!activeEvent || activeEvent.status === 'Ended' || activeEvent.status === 'Cancelled') return

    const position: [number, number] = [coords.longitude, coords.latitude]

    // Check geofences
    startGeofence.check(position)
    if (store.hasTriggeredStartLine) finishGeofence.check(position)

    const now = Date.now()
    const distanceFromStart = calculateDistanceAlongRoute(position, activeEvent.route)

    // Update pace history
    paceHistoryRef.current.push({ timestamp: now, distanceFromStart })

    // Trim to rolling 1-mile window
    const windowStart = paceHistoryRef.current.find(
      (p) => distanceFromStart - p.distanceFromStart <= MILE_IN_METERS
    )
    if (windowStart) {
      paceHistoryRef.current = paceHistoryRef.current.filter(
        (p) => distanceFromStart - p.distanceFromStart <= MILE_IN_METERS
      )
    }

    // Current pace — seconds per mile over rolling window
    let currentPaceSecondsPerMile: number | null = null
    const oldest = paceHistoryRef.current[0]
    const newest = paceHistoryRef.current[paceHistoryRef.current.length - 1]
    if (oldest && newest && oldest !== newest) {
      const windowDistance = newest.distanceFromStart - oldest.distanceFromStart
      const windowTime = (newest.timestamp - oldest.timestamp) / 1000
      if (windowDistance > 0) {
        currentPaceSecondsPerMile = (windowTime / windowDistance) * MILE_IN_METERS
      }
    }

    // Average pace — since start line crossing
    let averagePaceSecondsPerMile: number | null = null
    if (activeEvent.startedAt && distanceFromStart > 0) {
      const elapsedSeconds =
        (now - new Date(activeEvent.startedAt).getTime()) / 1000
      averagePaceSecondsPerMile = (elapsedSeconds / distanceFromStart) * MILE_IN_METERS
    }

    const location: EventLocation = {
      coordinates: position,
      timestamp: new Date(now).toISOString(),
      distanceFromStart,
      currentPaceSecondsPerMile,
      averagePaceSecondsPerMile,
    }

    store.updateLastLocation(location)

    // Push to server or buffer if offline
    if (navigator.onLine) {
      try {
        await eventsApi.pushLocation(activeEvent.id, location)
        offlineBuffer.flushBuffer() // flush any previously buffered points
      } catch {
        await offlineBuffer.bufferLocation(location)
      }
    } else {
      await offlineBuffer.bufferLocation(location)
    }
  }, [store, startGeofence, finishGeofence, offlineBuffer])

  const { start: startTracking, stop: stopTracking } = useGeolocation({
    minDistanceMeters: 10,
    onPosition: handlePosition,
  })

  const startEvent = useCallback(async (routeId: string) => {
    store.setStarting(true)
    store.setError(null)
    try {
      const event = await eventsApi.create(routeId)
      store.setActiveEvent(event)
      startTracking()
    } catch {
      store.setError('Failed to start event. Please try again.')
    } finally {
      store.setStarting(false)
    }
  }, [store, startTracking])

  const endEvent = useCallback(async () => {
    const { activeEvent } = store
    if (!activeEvent) return
    store.setEnding(true)
    try {
      const endedAt = new Date().toISOString()
      await eventsApi.updateStatus(activeEvent.id, 'Ended', { endedAt })
      stopTracking()
      store.clearActiveEvent()
    } catch {
      store.setError('Failed to end event. Please try again.')
    } finally {
      store.setEnding(false)
    }
  }, [store, stopTracking])

  const cancelEvent = useCallback(async (reason: CancelReason) => {
    const { activeEvent } = store
    if (!activeEvent) return
    store.setEnding(true)
    try {
      await eventsApi.updateStatus(activeEvent.id, 'Cancelled', {})
      store.setCancelReason(reason)
      stopTracking()
      store.clearActiveEvent()
    } catch {
      store.setError('Failed to cancel event. Please try again.')
    } finally {
      store.setEnding(false)
    }
  }, [store, stopTracking])

  return {
    activeEvent: store.activeEvent,
    isStarting: store.isStarting,
    isEnding: store.isEnding,
    error: store.error,
    hasTriggeredStartLine: store.hasTriggeredStartLine,
    hasTriggeredFinishLine: store.hasTriggeredFinishLine,
    elapsedSeconds: store.elapsedSeconds,
    startEvent,
    endEvent,
    cancelEvent,
  }
}