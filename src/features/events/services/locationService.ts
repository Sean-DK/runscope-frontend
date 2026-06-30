import { Geolocation } from '@capacitor/geolocation'
import { Capacitor } from '@capacitor/core'
import { haversineDistance } from '../hooks/useGeolocation'

type PositionHandler = (coords: GeolocationCoordinates) => void
type ErrorHandler = (error: unknown) => void

let watchId: string | null = null
let positionHandler: PositionHandler | null = null
let errorHandler: ErrorHandler | null = null
let lastPosition: [number, number] | null = null
const MIN_DISTANCE_METERS = 5

export const locationService = {
  async start(onPosition: PositionHandler, onError?: ErrorHandler) {
    positionHandler = onPosition
    errorHandler = onError ?? null

    if (watchId !== null) return

    lastPosition = null

    // Request permissions first on native
    if (Capacitor.isNativePlatform()) {
      const permission = await Geolocation.requestPermissions()
      if (permission.location !== 'granted') {
        errorHandler?.('Location permission denied')
        return
      }

      watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy:    true,
          timeout:               15000,
          minimumUpdateInterval: 5000
        },
        (pos, err) => {
          if (err || !pos) {
            console.error('watchPosition error:', err)
            errorHandler?.(err)
            return
          }

          const coords: [number, number] = [
            pos.coords.longitude,
            pos.coords.latitude,
          ]

          if (lastPosition) {
            const dist = haversineDistance(lastPosition, coords)
            if (dist < MIN_DISTANCE_METERS) return
          }

          lastPosition = coords

          // Capacitor returns a slightly different shape — adapt to
          // match GeolocationCoordinates interface expected by handlePosition
          positionHandler?.({
            latitude:         pos.coords.latitude,
            longitude:        pos.coords.longitude,
            accuracy:         pos.coords.accuracy,
            altitude:         pos.coords.altitude,
            altitudeAccuracy: pos.coords.altitudeAccuracy,
            heading:          pos.coords.heading,
            speed:            pos.coords.speed,
            toJSON:           () => pos.coords,
          } as GeolocationCoordinates)
        }
      )

      console.log('locationService: Capacitor watchPosition started, watchId:', watchId)

    } else {
      // Web fallback for browser/PWA
      const id = navigator.geolocation.watchPosition(
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
          console.error('watchPosition error:', err.code, err.message)
          errorHandler?.(err)
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
      )

      // Store as string to unify the type
      watchId = String(id)
      console.log('locationService: Web watchPosition started, watchId:', watchId)
    }
  },

  async stop() {
    if (watchId !== null) {
      if (Capacitor.isNativePlatform()) {
        await Geolocation.clearWatch({ id: watchId })
      } else {
        navigator.geolocation.clearWatch(Number(watchId))
      }
      console.log('locationService: watchPosition cleared, watchId:', watchId)
      watchId = null
    }
    positionHandler = null
    errorHandler    = null
    lastPosition    = null
  },

  isRunning() {
    return watchId !== null
  },
}