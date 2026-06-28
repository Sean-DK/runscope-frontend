import { fetchClient } from '../../shared/utils/fetchClient'
import { RaceEvent } from '../events/types'

export const spectatorApi = {
  getEventById: async (id: string): Promise<RaceEvent> => {
    return fetchClient<RaceEvent>(`/api/events/${id}`)
  },

  getEventByCode: async (code: string): Promise<RaceEvent> => {
    return fetchClient<RaceEvent>(`/api/events/code/${code}`)
  },
}