import { useCallback, useRef } from 'react'
import { haversineDistance } from './useGeolocation'

interface GeofenceOptions {
  center: [number, number]
  radiusMeters: number
  onEnter: () => void
}

// One-shot geofence — fires onEnter once when the position enters the radius,
// then deactivates itself so it doesn't re-fire on subsequent GPS updates
export const useGeofence = ({ center, radiusMeters, onEnter }: GeofenceOptions) => {
  const firedRef = useRef(false)

  const check = useCallback((position: [number, number]) => {
    if (firedRef.current) return
    const distance = haversineDistance(position, center)
    if (distance <= radiusMeters) {
      firedRef.current = true
      onEnter()
    }
  }, [center, radiusMeters, onEnter])

  const reset = useCallback(() => {
    firedRef.current = false
  }, [])

  return { check, reset }
}