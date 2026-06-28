import { create } from 'zustand'
import { Route, RouteSegment, Waypoint } from '../types'

interface RouteState {
    routes: Route[]
    isLoadingRoutes: boolean

    draftRoute: Route | null
    isDirty: boolean

    selectedWaypointId: string | null
    isSaving: boolean
    error: string | null

    setRoutes: (routes: Route[]) => void
    setLoadingRoutes: (loading: boolean) => void

    initDraft: (route?: Route) => void
    setDraftName: (name: string) => void
    addWaypoint: (waypoint: Waypoint) => void
    updateWaypoint: (id: string, coordinates: [number, number]) => void
    removeWaypoint: (id: string) => void
    setSegments: (segments: RouteSegment[]) => void
    clearDraft: () => void

    setSelectedWaypoint: (id: string | null) => void
    setSaving: (saving: boolean) => void
    setError: (error: string | null) => void

    getOrderedWaypoints: () => Waypoint[]
}

const calculateTotalDistance = (segments: RouteSegment[]): number =>
    segments.reduce((sum, seg) => sum + seg.distance, 0)

const newDraftRoute = (): Route => ({
    id: '',
    name: '',
    waypoints: [],
    segments: [],
    totalDistance: 0,
    createdAt: '',
    updatedAt: '',
})

export const useRouteStore = create<RouteState>((set, get) => ({
    routes: [],
    isLoadingRoutes: false,
    draftRoute: null,
    isDirty: false,
    selectedWaypointId: null,
    isSaving: false,
    error: null,

    setRoutes: (routes) => set({ routes }),
    setLoadingRoutes: (loading) => set({ isLoadingRoutes: loading }),

    initDraft: (route) => set({
        draftRoute: route ? { ...route } : newDraftRoute(),
        isDirty: false,
        error: null,
    }),

    setDraftName: (name) => set((state) => ({
        draftRoute: state.draftRoute ? { ...state.draftRoute, name } : null,
        isDirty: true,
    })),

    addWaypoint: (waypoint) => set((state) => {
        if (!state.draftRoute) return {}
        const waypoints = [...state.draftRoute.waypoints, waypoint]
        return {
            draftRoute: { ...state.draftRoute, waypoints },
            isDirty: true,
        }
    }),

    updateWaypoint: (id, coordinates) => set((state) => {
        if (!state.draftRoute) return {}
        const waypoints = state.draftRoute.waypoints.map((wp) =>
            wp.id === id ? { ...wp, coordinates } : wp
        )
        return {
            draftRoute: { ...state.draftRoute, waypoints },
            isDirty: true
        }
    }),

    removeWaypoint: (id) => set((state) => {
        if (!state.draftRoute) return {}
        const waypoints = state.draftRoute.waypoints
            .filter((wp) => wp.id !== id)
            .map((wp, i) => ({ ...wp, order: i }))
        const segments = state.draftRoute.segments.filter(
            (seg) => seg.fromWaypointId !== id && seg.toWaypointId !== id
        )
        return {
            draftRoute: {
                ...state.draftRoute,
                waypoints,
                segments,
                totalDistance: calculateTotalDistance(segments),
            },
            isDirty: true,
        }
    }),

    setSegments: (segments) => set((state) => ({
        draftRoute: state.draftRoute
            ? { ...state.draftRoute, segments, totalDistance: calculateTotalDistance(segments) }
            : null,
        isDirty: true,
    })),

    clearDraft: () => set({
        draftRoute: null,
        isDirty: false,
        selectedWaypointId: null,
        error: null,
    }),

    setSelectedWaypoint: (id) => set({ selectedWaypointId: id }),
    setSaving: (saving) => set({ isSaving: saving }),
    setError: (error) => set({ error }),

    getOrderedWaypoints: () => {
        const { draftRoute } = get()
        if (!draftRoute) return []
        return [...draftRoute.waypoints].sort((a, b) => a.order - b.order)
    },
}))