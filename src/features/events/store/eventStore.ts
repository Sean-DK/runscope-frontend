import { create } from 'zustand'
import { RaceEvent, EventStatus, EventLocation, CancelReason } from '../types'

interface EventState {
  // Active hosted event
  activeEvent: RaceEvent | null

  // UI state
  isStarting: boolean   // creating the event on the server
  isEnding: boolean     // ending/cancelling the event
  error: string | null

  // Geofence triggered flags
  hasTriggeredStartLine: boolean
  hasTriggeredFinishLine: boolean

  // Actions
  setActiveEvent: (event: RaceEvent) => void
  updateEventStatus: (status: EventStatus) => void
  updateLastLocation: (location: EventLocation) => void
  setStartedAt: (timestamp: string) => void
  setFinishedAt: (timestamp: string) => void
  setCancelReason: (reason: CancelReason) => void
  setStarting: (starting: boolean) => void
  setEnding: (ending: boolean) => void
  setError: (error: string | null) => void
  setHasTriggeredStartLine: (triggered: boolean) => void
  setHasTriggeredFinishLine: (triggered: boolean) => void
  clearActiveEvent: () => void

  // Computed
  elapsedSeconds: () => number | null
}

export const useEventStore = create<EventState>((set, get) => ({
  activeEvent: null,
  isStarting: false,
  isEnding: false,
  error: null,
  hasTriggeredStartLine: false,
  hasTriggeredFinishLine: false,

  setActiveEvent: (event) => set({ activeEvent: event }),

  updateEventStatus: (status) => set((state) => ({
    activeEvent: state.activeEvent
      ? { ...state.activeEvent, status }
      : null,
  })),

  updateLastLocation: (location) => set((state) => ({
    activeEvent: state.activeEvent
      ? { ...state.activeEvent, lastLocation: location }
      : null,
  })),

  setStartedAt: (timestamp) => set((state) => ({
    activeEvent: state.activeEvent
      ? { ...state.activeEvent, startedAt: timestamp, status: 'Active' }
      : null,
  })),

  setFinishedAt: (timestamp) => set((state) => ({
    activeEvent: state.activeEvent
      ? { ...state.activeEvent, finishedAt: timestamp, status: 'Finished' }
      : null,
  })),

  setCancelReason: (reason) => set((state) => ({
    activeEvent: state.activeEvent
      ? { ...state.activeEvent, cancelReason: reason }
      : null,
  })),

  setStarting: (starting) => set({ isStarting: starting }),
  setEnding: (ending) => set({ isEnding: ending }),
  setError: (error) => set({ error }),

  setHasTriggeredStartLine: (triggered) =>
    set({ hasTriggeredStartLine: triggered }),

  setHasTriggeredFinishLine: (triggered) =>
    set({ hasTriggeredFinishLine: triggered }),

  clearActiveEvent: () => set({
    activeEvent: null,
    isStarting: false,
    isEnding: false,
    error: null,
    hasTriggeredStartLine: false,
    hasTriggeredFinishLine: false,
  }),

  elapsedSeconds: () => {
    const { activeEvent } = get()
    if (!activeEvent?.startedAt) return null
    const start = new Date(activeEvent.startedAt).getTime()
    const end = activeEvent.finishedAt
      ? new Date(activeEvent.finishedAt).getTime()
      : Date.now()
    return Math.floor((end - start) / 1000)
  },
}))