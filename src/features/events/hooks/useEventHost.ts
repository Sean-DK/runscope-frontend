import { useCallback, useEffect, useRef } from 'react'
import { useEventStore } from '../store/eventStore'
import { locationService } from '../services/locationService.ts'
import { useGeofence } from './useGeofence'
import { useOfflineBuffer } from './useOfflineBuffer'
import { eventsApi } from '../api'
import { CancelReason, EventLocation } from '../types'
import { Route } from '../../routes/types'

const calculateDistanceAlongRoute = (
  position: [number, number],
  route: Route
): number => {
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

const MILE_IN_METERS = 1609.344

interface PaceTracker {
  timestamp: number
  distanceFromStart: number
}

export const useEventHost = () => {
  const store = useEventStore()
  const paceHistoryRef = useRef<PaceTracker[]>([])
  const offlineBuffer = useOfflineBuffer(store.activeEvent?.id ?? '')

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

    startGeofence.check(position)
    if (store.hasTriggeredStartLine) finishGeofence.check(position)

    const now = Date.now()
    const distanceFromStart = calculateDistanceAlongRoute(position, activeEvent.route)

    paceHistoryRef.current.push({ timestamp: now, distanceFromStart })

    const windowStart = paceHistoryRef.current.find(
      (p) => distanceFromStart - p.distanceFromStart <= MILE_IN_METERS
    )
    if (windowStart) {
      paceHistoryRef.current = paceHistoryRef.current.filter(
        (p) => distanceFromStart - p.distanceFromStart <= MILE_IN_METERS
      )
    }

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

    if (navigator.onLine) {
      try {
        await eventsApi.pushLocation(activeEvent.id, location)
        offlineBuffer.flushBuffer()
      } catch {
        await offlineBuffer.bufferLocation(location)
      }
    } else {
      await offlineBuffer.bufferLocation(location)
    }
  }, [store, startGeofence, finishGeofence, offlineBuffer])

  useEffect(() => {
    if (store.activeEvent &&
        (store.activeEvent.status === 'Pending' ||
         store.activeEvent.status === 'Active')) {
      locationService.start(handlePosition)
    }
  }, [handlePosition, store.activeEvent?.status])

  const rehydrateActiveEvent = useCallback(async () => {
    try {
      const event = await eventsApi.getActive()
      if (!event) return false
  
      store.setActiveEvent(event)
      if (event.startedAt) store.setHasTriggeredStartLine(true)
      if (event.finishedAt) store.setHasTriggeredFinishLine(true)
  
      if (event.status === 'Pending' || event.status === 'Active') {
        locationService.start(handlePosition)
      }
  
      return true
    } catch {
      return false
    }
  }, [store, handlePosition])
  
  const startEvent = useCallback(async (routeId: string) => {
    store.setStarting(true)
    store.setError(null)
    try {
      const event = await eventsApi.create(routeId)
      store.setActiveEvent(event)
      locationService.start(handlePosition)
    } catch {
      store.setError('Failed to start event. Please try again.')
    } finally {
      store.setStarting(false)
    }
  }, [store, handlePosition])
  
  const endEvent = useCallback(async () => {
    const { activeEvent } = store
    if (!activeEvent) return
    store.setEnding(true)
    try {
      const endedAt = new Date().toISOString()
      await eventsApi.updateStatus(activeEvent.id, 'Ended', { endedAt })
      locationService.stop()
      store.clearActiveEvent()
    } catch {
      store.setError('Failed to end event. Please try again.')
    } finally {
      store.setEnding(false)
    }
  }, [store])
  
  const cancelEvent = useCallback(async (reason: CancelReason) => {
    const { activeEvent } = store
    if (!activeEvent) return
    store.setEnding(true)
    try {
      await eventsApi.updateStatus(activeEvent.id, 'Cancelled', { cancelReason: reason })
      store.setCancelReason(reason)
      locationService.stop()
      store.clearActiveEvent()
    } catch {
      store.setError('Failed to cancel event. Please try again.')
    } finally {
      store.setEnding(false)
    }
  }, [store])

  return {
    activeEvent: store.activeEvent,
    isStarting: store.isStarting,
    isEnding: store.isEnding,
    error: store.error,
    hasTriggeredStartLine: store.hasTriggeredStartLine,
    hasTriggeredFinishLine: store.hasTriggeredFinishLine,
    elapsedSeconds: store.elapsedSeconds,
    rehydrateActiveEvent,
    startEvent,
    endEvent,
    cancelEvent,
  }
}