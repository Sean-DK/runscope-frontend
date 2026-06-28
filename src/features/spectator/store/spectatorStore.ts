import { create } from 'zustand'
import { RaceEvent, EventLocation } from '../../events/types'
import { ConnectionStatus, MapMode, SpectatorStats } from '../types'

const emptyStats = (): SpectatorStats => ({
  currentPaceSecondsPerMile: null,
  averagePaceSecondsPerMile: null,
  elapsedSeconds: null,
  distanceRemainingMeters: null,
  estimatedFinishSeconds: null,
  estimatedFinishTimestamp: null,
})

interface SpectatorStoreState {
  event: RaceEvent | null
  racerPosition: [number, number] | null
  stats: SpectatorStats
  connectionStatus: ConnectionStatus
  mapMode: MapMode
  error: string | null

  // Actions
  setEvent: (event: RaceEvent) => void
  setConnectionStatus: (status: ConnectionStatus) => void
  setMapMode: (mode: MapMode) => void
  setError: (error: string | null) => void
  applyLocationUpdate: (location: EventLocation) => void
  clearSpectator: () => void
}

export const useSpectatorStore = create<SpectatorStoreState>((set, get) => ({
  event: null,
  racerPosition: null,
  stats: emptyStats(),
  connectionStatus: 'Connecting',
  mapMode: 'follow',
  error: null,

  setEvent: (event) => set({ event }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setMapMode: (mode) => set({ mapMode: mode }),
  setError: (error) => set({ error }),

  applyLocationUpdate: (location) => {
    const { event } = get()
    if (!event) return

    const totalDistance = event.route.totalDistance
    const distanceRemainingMeters = Math.max(
      0,
      totalDistance - location.distanceFromStart
    )

    // Estimated finish — only meaningful if we have average pace
    let estimatedFinishSeconds: number | null = null
    let estimatedFinishTimestamp: string | null = null
    if (location.averagePaceSecondsPerMile !== null && distanceRemainingMeters > 0) {
      const remainingMiles = distanceRemainingMeters / 1609.344
      estimatedFinishSeconds = Math.round(
        location.averagePaceSecondsPerMile * remainingMiles
      )
      estimatedFinishTimestamp = new Date(
        Date.now() + estimatedFinishSeconds * 1000
      ).toISOString()
    }

    // Elapsed seconds since start line crossing
    let elapsedSeconds: number | null = null
    if (event.startedAt) {
      elapsedSeconds = Math.floor(
        (Date.now() - new Date(event.startedAt).getTime()) / 1000
      )
    }

    set({
      racerPosition: location.coordinates,
      stats: {
        currentPaceSecondsPerMile: location.currentPaceSecondsPerMile,
        averagePaceSecondsPerMile: location.averagePaceSecondsPerMile,
        elapsedSeconds,
        distanceRemainingMeters,
        estimatedFinishSeconds,
        estimatedFinishTimestamp,
      },
    })
  },

  clearSpectator: () => set({
    event: null,
    racerPosition: null,
    stats: emptyStats(),
    connectionStatus: 'Connecting',
    mapMode: 'follow',
    error: null,
  }),
}))