import { useCallback, useEffect, useRef } from 'react'
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { useSpectatorStore } from '../store/spectatorStore'
import { EventLocation, RaceEvent } from '../../events/types'
import { getOrderedRouteCoordinates } from '../../routes/utils/routeGeometry'

const IS_DEV = import.meta.env.DEV
const SIGNALR_HUB_URL = import.meta.env.VITE_SIGNALR_HUB_URL as string | undefined

export const useSpectatorSignalR = (eventId: string | null) => {
  const store = useSpectatorStore()
  const connectionRef = useRef<HubConnection | null>(null)
  const dummyIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopDummy = useCallback(() => {
    if (dummyIntervalRef.current) {
      clearInterval(dummyIntervalRef.current)
      dummyIntervalRef.current = null
    }
  }, [])

  const startDummy = useCallback((_eventId: string) => {
    const { event } = useSpectatorStore.getState()
    if (!event) return

    store.setConnectionStatus('Connected')

    // Simulate the racer moving along the route segments
    const allCoords = getOrderedRouteCoordinates(event.route)
    if (allCoords.length === 0) return

    let index = 0
    let distanceCovered = 0

    dummyIntervalRef.current = setInterval(() => {
      if (index >= allCoords.length) {
        stopDummy()
        return
      }

      const coordinates = allCoords[index] as [number, number]

      // Rough distance increment per step
      if (index > 0) {
        const prev = allCoords[index - 1] as [number, number]
        const R = 6371000
        const toRad = (d: number) => (d * Math.PI) / 180
        const dLat = toRad(coordinates[1] - prev[1])
        const dLng = toRad(coordinates[0] - prev[0])
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(prev[1])) *
          Math.cos(toRad(coordinates[1])) *
          Math.sin(dLng / 2) ** 2
        distanceCovered += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      }

      // Simulate ~9 min/mile pace in seconds per meter
      const paceSecondsPerMile = 540

      const location: EventLocation = {
        coordinates,
        timestamp: new Date().toISOString(),
        distanceFromStart: distanceCovered,
        currentPaceSecondsPerMile: paceSecondsPerMile + (Math.random() * 30 - 15),
        averagePaceSecondsPerMile: paceSecondsPerMile + (Math.random() * 10 - 5),
      }

      store.applyLocationUpdate(location)
      index++
    }, 1500) // fast interval for testing; real updates come every ~10s
  }, [store, stopDummy])

  const connect = useCallback(async (eventId: string) => {
    // Use dummy emitter in dev if no SignalR hub URL is configured
    if (IS_DEV && !SIGNALR_HUB_URL) {
      setTimeout(() => startDummy(eventId), 800) // brief delay to simulate connection
      return
    }

    try {
      store.setConnectionStatus('Connecting')

      const connection = new HubConnectionBuilder()
        .withUrl(`${SIGNALR_HUB_URL}/hubs/spectator`)
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Warning)
        .build()

      connection.on('LocationUpdate', (location: EventLocation) => {
        store.applyLocationUpdate(location)
      })

      connection.on('StatusUpdate', (update: {
        status: string
        cancelReason: string | null
        startedAt: string | null
        finishedAt: string | null
        endedAt: string | null
      }) => {
        const { event } = useSpectatorStore.getState()
        if (!event) return
    
        useSpectatorStore.getState().setEvent({
            ...event,
            status: update.status as RaceEvent['status'],
            cancelReason: update.cancelReason as RaceEvent['cancelReason'],
            startedAt: update.startedAt,
            finishedAt: update.finishedAt,
            endedAt: update.endedAt,
        })
      })

      connection.onreconnecting(() => store.setConnectionStatus('Reconnecting'))
      connection.onreconnected(() => store.setConnectionStatus('Connected'))
      connection.onclose(() => store.setConnectionStatus('Disconnected'))

      await connection.start()
      await connection.invoke('JoinEvent', eventId)

      store.setConnectionStatus('Connected')
      connectionRef.current = connection
    } catch {
      store.setConnectionStatus('Disconnected')
      store.setError('Could not connect to the event. Please refresh to try again.')
    }
  }, [store, startDummy])

  const disconnect = useCallback(async () => {
    stopDummy()
    if (connectionRef.current) {
      await connectionRef.current.stop()
      connectionRef.current = null
    }
    store.setConnectionStatus('Disconnected')
  }, [store, stopDummy])

  useEffect(() => {
    if (!eventId) return
    connect(eventId)
    return () => { disconnect() }
  }, [eventId])

  return { connect, disconnect }
}