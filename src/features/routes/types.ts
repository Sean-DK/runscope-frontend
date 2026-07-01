export interface Waypoint {
    id: string
    coordinates: [number, number] // [longitude, latitude]
    order: number
}

export interface RouteSegment {
    fromWaypointId: string
    toWaypointId: string
    path: [number, number][] // road geometry from Mapbox
    distance: number // meters
}

export interface Route {
    id: string
    name: string
    waypoints: Waypoint[]
    segments: RouteSegment[]
    totalDistance: number // meters
    elevationGainMeters: number | null
    createdAt: string
    updatedAt: string
}

export type RouteBuidlerMode = 'create' | 'edit' | 'view'