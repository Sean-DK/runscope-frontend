import { fetchClient } from '../../shared/utils/fetchClient'
import { Route } from './types'

interface UpsertRoutePayload {
  name: string
  totalDistance: number
  waypoints: { clientId: string; order: number; coordinates: [number, number] }[]
  segments: {
    fromWaypointId: string
    toWaypointId: string
    distance: number
    path: [number, number][]
  }[]
}

const toPayload = (route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): UpsertRoutePayload => ({
  name: route.name,
  totalDistance: route.totalDistance,
  waypoints: route.waypoints.map((w) => ({
    clientId: w.id,  // send client-side ID so backend can map segments
    order: w.order,
    coordinates: w.coordinates,
  })),
  segments: route.segments.map((s) => ({
    fromWaypointId: s.fromWaypointId,
    toWaypointId: s.toWaypointId,
    distance: s.distance,
    path: s.path,
  })),
})

export const routesApi = {
  getAll: async (): Promise<Route[]> => {
    return fetchClient<Route[]>('/api/routes')
  },

  getById: async (id: string): Promise<Route> => {
    return fetchClient<Route>(`/api/routes/${id}`)
  },

  getShared: async (id: string): Promise<Route> => {
    return fetchClient<Route>(`/api/routes/shared/${id}`)
  },

  create: async (route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<Route> => {
    return fetchClient<Route>('/api/routes', {
      method: 'POST',
      body: toPayload(route),
    })
  },

  update: async (id: string, route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<Route> => {
    return fetchClient<Route>(`/api/routes/${id}`, {
      method: 'PUT',
      body: toPayload(route),
    })
  },

  delete: async (id: string): Promise<void> => {
    return fetchClient(`/api/routes/${id}`, { method: 'DELETE' })
  },

  saveShared: async (id: string): Promise<Route> => {
    return fetchClient<Route>(`/api/routes/shared/${id}/save`, { method: 'POST' })
  },
}