import { RaceEvent } from '../events/types'

export type ConnectionStatus =
  | 'Connecting'
  | 'Connected'
  | 'Reconnecting'
  | 'Disconnected'

export type MapMode = 'follow' | 'overview'

export interface SpectatorStats {
  currentPaceSecondsPerMile: number | null
  averagePaceSecondsPerMile: number | null
  elapsedSeconds: number | null
  distanceRemainingMeters: number | null
  estimatedFinishSeconds: number | null   // seconds from now until finish
  estimatedFinishTimestamp: string | null // ISO timestamp of estimated finish
}

export interface SpectatorState {
  event: RaceEvent | null
  racerPosition: [number, number] | null  // [lng, lat]
  stats: SpectatorStats
  connectionStatus: ConnectionStatus
  mapMode: MapMode
  error: string | null
}