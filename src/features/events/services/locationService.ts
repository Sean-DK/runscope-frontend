import { Capacitor, registerPlugin } from '@capacitor/core'
import { haversineDistance } from '../hooks/useGeolocation'
import { LocalNotifications } from '@capacitor/local-notifications'
import { BackgroundGeolocationPlugin } from "@capacitor-community/background-geolocation"

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>("BackgroundGeolocation");

type PositionHandler = (coords: GeolocationCoordinates) => void
type ErrorHandler = (error: unknown) => void

let watchId: string | null = null
let isStarting = false
let positionHandler: PositionHandler | null = null
let errorHandler: ErrorHandler | null = null
let lastPosition: [number, number] | null = null
const MIN_DISTANCE_METERS = 5

export const locationService = {
  async start(onPosition: PositionHandler, onError?: ErrorHandler) {
    positionHandler = onPosition
    errorHandler = onError ?? null

    if (watchId !== null || isStarting) return
    isStarting = true

    try {
      lastPosition = null

      if (Capacitor.isNativePlatform()) {
        const notifPermission = await LocalNotifications.requestPermissions()
        console.log('Notification permission:', notifPermission.display)

        watchId = await BackgroundGeolocation.addWatcher(
          {
            backgroundMessage:   'RunScope is tracking your location.',
            backgroundTitle:     'RunScope',
            requestPermissions:  true,
            stale:               false,
            distanceFilter:      MIN_DISTANCE_METERS,
          },
          (location, error) => {
            if (error) {
              console.error('BackgroundGeolocation error:', error)
              errorHandler?.(error)
              return
            }
            if (!location) return

            const coords: [number, number] = [location.longitude, location.latitude]
            lastPosition = coords

            // Adapt to GeolocationCoordinates shape expected by handlePosition
            positionHandler?.({
              latitude:         location.latitude,
              longitude:        location.longitude,
              accuracy:         location.accuracy,
              altitude:         location.altitude ?? null,
              altitudeAccuracy: null,
              heading:          location.bearing ?? null,
              speed:            location.speed ?? null,
              toJSON:           () => ({}),
            } as GeolocationCoordinates)
          }
        )

        console.log('locationService: BackgroundGeolocation started, watchId:', watchId)

      } else {
        // Web fallback
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

        watchId = String(id)
        console.log('locationService: Web watchPosition started, watchId:', watchId)
      }
    } finally {
      isStarting = false
    }
  },

  async stop() {
    if (watchId !== null) {
      if (Capacitor.isNativePlatform()) {
        await BackgroundGeolocation.removeWatcher({ id: watchId })
      } else {
        navigator.geolocation.clearWatch(Number(watchId))
      }
      console.log('locationService: stopped, watchId:', watchId)
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