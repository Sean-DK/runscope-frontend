import { useCallback, useEffect, useRef } from 'react'

interface GeolocationOptions {
  minDistanceMeters?: number
  onPosition: (coords: GeolocationCoordinates) => void
  onError?: (error: GeolocationPositionError) => void
}

// Haversine formula — distance between two GPS coords in meters
export const haversineDistance = (
  [lng1, lat1]: [number, number],
  [lng2, lat2]: [number, number]
): number => {
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const useGeolocation = ({
  minDistanceMeters = 5,
  onPosition,
  onError,
}: GeolocationOptions) => {
  const watchIdRef = useRef<number | null>(null)
  const lastPositionRef = useRef<[number, number] | null>(null)
  const onPositionRef = useRef(onPosition)
  const onErrorRef = useRef(onError)

  // Keep refs current without restarting the watch
  useEffect(() => { onPositionRef.current = onPosition }, [onPosition])
  useEffect(() => { onErrorRef.current = onError }, [onError])

  const start = useCallback(() => {
    if (watchIdRef.current !== null) return // already watching

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude]

        // Skip update if haven't moved minimum distance
        if (lastPositionRef.current) {
          const dist = haversineDistance(lastPositionRef.current, coords)
          if (dist < minDistanceMeters) return
        }

        lastPositionRef.current = coords
        onPositionRef.current(pos.coords)
      },
      (err) => onErrorRef.current?.(err),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    )
  }, [minDistanceMeters])

  const stop = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }, [])

  // Clean up watch on unmount
  useEffect(() => () => stop(), [stop])

  return { start, stop }
}