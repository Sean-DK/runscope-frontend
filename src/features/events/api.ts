import { fetchClient } from '../../shared/utils/fetchClient'
import { RaceEvent, CancelReason, EventLocation } from './types'

export const eventsApi = {
  create: async (routeId: string): Promise<RaceEvent> => {
    return fetchClient<RaceEvent>('/api/events', {
      method: 'POST',
      body: { routeId },
    })
  },

  getById: async (id: string): Promise<RaceEvent> => {
    return fetchClient<RaceEvent>(`/api/events/${id}`)
  },

  getByCode: async (code: string): Promise<RaceEvent> => {
    return fetchClient<RaceEvent>(`/api/events/code/${code}`)
  },

  getPast: async (): Promise<RaceEvent[]> => {
    return fetchClient<RaceEvent[]>('/api/events/past')
  },

  getByIdForReview: async (id: string): Promise<RaceEvent> => {
    return fetchClient<RaceEvent>(`/api/events/past/${id}`)
  },

  updateStatus: async (
    id: string,
    status: RaceEvent['status'],
    extra?: {
      cancelReason?: CancelReason
      startedAt?: string
      finishedAt?: string
      endedAt?: string
    }
  ): Promise<void> => {
    await fetchClient(`/api/events/${id}/status`, {
      method: 'PATCH',
      body: {
        status,
        cancelReason: extra?.cancelReason ?? null,
        startedAt: extra?.startedAt ?? null,
        finishedAt: extra?.finishedAt ?? null,
        endedAt: extra?.endedAt ?? null,
      },
    })
  },

  pushLocation: async (id: string, location: EventLocation): Promise<void> => {
    await fetchClient(`/api/events/${id}/locations`, {
      method: 'POST',
      body: {
        coordinates: location.coordinates,
        distanceFromStart: location.distanceFromStart,
        currentPaceSecondsPerMile: location.currentPaceSecondsPerMile,
        averagePaceSecondsPerMile: location.averagePaceSecondsPerMile,
        timestamp: location.timestamp,
      },
    })
  },
}