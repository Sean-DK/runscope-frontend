import { Route } from '../routes/types'

export type EventStatus =
  | 'Pending'    // started, waiting to cross start line
  | 'Active'     // start line crossed, clock running
  | 'Finished'   // end of route reached, clock stopped
  | 'Cancelled'  // racer cancelled
  | 'Ended'      // racer manually ended, no longer joinable

export type CancelReason =
  | 'DNF'
  | 'Injury'
  | 'Weather'
  | 'Personal'
  | 'Other'

export const CANCEL_REASONS: { value: CancelReason; label: string }[] = [
  { value: 'DNF',      label: 'DNF' },
  { value: 'Injury',   label: 'Injury' },
  { value: 'Weather',  label: 'Weather' },
  { value: 'Other',    label: 'Other' },
]

export interface EventLocation {
  coordinates: [number, number]  // [lng, lat]
  timestamp: string              // ISO
  distanceFromStart: number      // meters along route
  currentPaceSecondsPerMile: number | null
  averagePaceSecondsPerMile: number | null
}

export interface RaceEvent {
  id: string
  eventCode: string
  routeId: string
  route: Route
  status: EventStatus
  cancelReason?: CancelReason
  createdAt: string         // when racer pressed Start Event
  startedAt: string | null  // when start line geofence was crossed
  finishedAt: string | null // when finish line geofence was crossed
  endedAt: string | null    // when racer pressed End Event
  lastLocation: EventLocation | null
}

// Buffered location point stored in IndexedDB when offline
export interface BufferedLocation {
  id: string
  eventId: string
  location: EventLocation
  syncedAt: string | null
}