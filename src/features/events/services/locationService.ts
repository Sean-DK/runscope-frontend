import { haversineDistance } from '../hooks/useGeolocation'

type PositionHandler = (coords: GeolocationCoordinates) => void
type ErrorHandler = (error: GeolocationPositionError) => void

// Module-level singleton — survives component mount/unmount cycles
let watchId: number | null = null
let positionHandler: PositionHandler | null = null
let errorHandler: ErrorHandler | null = null
let lastPosition: [number, number] | null = null
const MIN_DISTANCE_METERS = 0 // TODO: 10 for real testing, 0 for dev indoors

export const locationService = {
  start(onPosition: PositionHandler, onError?: ErrorHandler) {
    // Update handlers without restarting the watch
    positionHandler = onPosition
    errorHandler = onError ?? null

    if (watchId !== null) return // already watching

    lastPosition = null

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude]

        if (lastPosition) {
          const dist = haversineDistance(lastPosition, coords)
          if (dist < MIN_DISTANCE_METERS) return
        }

        lastPosition = coords
        positionHandler?.(pos.coords)
      },
      (err) => {
        errorHandler?.(err)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    )
  },

  stop() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
    positionHandler = null
    errorHandler = null
    lastPosition = null
  },

  isRunning() {
    return watchId !== null
  },
}