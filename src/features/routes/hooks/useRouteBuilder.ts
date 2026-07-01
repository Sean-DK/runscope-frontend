import { useCallback } from 'react'
import { useRouteStore } from '../store/routeStore'
import { useMapbox } from './useMapbox'
import { useGpxImport } from './useGpxImport'
import { routesApi } from '../api'
import { Route } from '../types'

export const useRouteBuilder = () => {
  const store = useRouteStore()
  const { recalculateSegments, recalculateAdjacentSegments } = useMapbox()
  const { importFile } = useGpxImport()

  const initNew = useCallback(() => {
    store.initDraft()
  }, [store])

  const initEdit = useCallback((route: Route) => {
    store.initDraft(route)
  }, [store])

  const handleMapClick = useCallback((coordinates: [number, number]) => {
    const waypoint = {
      id: crypto.randomUUID(),
      coordinates,
      order: store.draftRoute?.waypoints.length ?? 0,
    }
    store.addWaypoint(waypoint)

    const updatedWaypoints = [
      ...(store.draftRoute?.waypoints ?? []),
      waypoint,
    ].sort((a, b) => a.order - b.order)

    if (updatedWaypoints.length >= 2)
      recalculateSegments(updatedWaypoints)
  }, [store, recalculateSegments])

  const handleWaypointDragEnd = useCallback((
    waypointId: string,
    newCoordinates: [number, number]
  ) => {
    store.updateWaypoint(waypointId, newCoordinates)
    const updatedWaypoints = store.getOrderedWaypoints().map((wp) =>
      wp.id === waypointId ? { ...wp, coordinates: newCoordinates } : wp
    )
    recalculateAdjacentSegments(waypointId, updatedWaypoints)
  }, [store, recalculateAdjacentSegments])

  const handleRemoveWaypoint = useCallback((waypointId: string) => {
    store.removeWaypoint(waypointId)
    const remainingWaypoints = store.getOrderedWaypoints()
      .filter((wp) => wp.id !== waypointId)
    if (remainingWaypoints.length >= 2)
      recalculateSegments(remainingWaypoints)
  }, [store, recalculateSegments])

  const handleSave = useCallback(async () => {
    const { draftRoute } = store
    if (!draftRoute) return
    if (!draftRoute.name.trim()) {
      store.setError('Please enter a route name.')
      return
    }
    if (draftRoute.waypoints.length < 2) {
      store.setError('A route needs at least 2 waypoints.')
      return
    }

    store.setSaving(true)
    store.setError(null)

    try {
      const payload = {
        name: draftRoute.name,
        waypoints: draftRoute.waypoints,
        segments: draftRoute.segments,
        totalDistance: draftRoute.totalDistance,
        elevationGainMeters: draftRoute.elevationGainMeters,
      }

      if (draftRoute.id) {
        await routesApi.update(draftRoute.id, payload)
      } else {
        await routesApi.create(payload)
      }

      store.clearDraft()
      return true
    } catch {
      store.setError('Failed to save route. Please try again.')
      return false
    } finally {
      store.setSaving(false)
    }
  }, [store])

  const handleDelete = useCallback(async () => {
    const { draftRoute } = store
    if (!draftRoute?.id) return

    store.setSaving(true)
    store.setError(null)

    try {
      await routesApi.delete(draftRoute.id)
      store.clearDraft()
    } catch {
      store.setError('Failed to delete route. Please try again.')
    } finally {
      store.setSaving(false)
    }
  }, [store])

  return {
    draftRoute: store.draftRoute,
    isDirty: store.isDirty,
    isSaving: store.isSaving,
    error: store.error,
    selectedWaypointId: store.selectedWaypointId,
    orderedWaypoints: store.getOrderedWaypoints(),
    initNew,
    initEdit,
    handleMapClick,
    handleWaypointDragEnd,
    handleRemoveWaypoint,
    handleSave,
    handleDelete,
    setName: store.setDraftName,
    clearDraft: store.clearDraft,
    setSelectedWaypoint: store.setSelectedWaypoint,
    importFile,
  }
}