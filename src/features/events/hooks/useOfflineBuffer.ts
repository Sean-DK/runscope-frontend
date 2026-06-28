import { useCallback } from 'react'
import { EventLocation, BufferedLocation } from '../types'
import { eventsApi } from '../api'

const DB_NAME = 'runscope'
const STORE_NAME = 'locationBuffer'
const DB_VERSION = 1

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

const dbPut = async (item: BufferedLocation): Promise<void> => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(item)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

const dbGetAll = async (): Promise<BufferedLocation[]> => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

const dbDelete = async (id: string): Promise<void> => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export const useOfflineBuffer = (eventId: string) => {
  // Buffer a location point locally when offline
  const bufferLocation = useCallback(async (location: EventLocation) => {
    const item: BufferedLocation = {
      id: crypto.randomUUID(),
      eventId,
      location,
      syncedAt: null,
    }
    await dbPut(item)
  }, [eventId])

  // Attempt to flush all buffered points to the server
  const flushBuffer = useCallback(async () => {
    const items = await dbGetAll()
    const unsyncedForEvent = items.filter(
      (i) => i.eventId === eventId && !i.syncedAt
    )
    if (unsyncedForEvent.length === 0) return

    // Push in chronological order
    const sorted = unsyncedForEvent.sort(
      (a, b) =>
        new Date(a.location.timestamp).getTime() -
        new Date(b.location.timestamp).getTime()
    )

    for (const item of sorted) {
      try {
        await eventsApi.pushLocation(eventId, item.location)
        await dbDelete(item.id)
      } catch {
        // Stop flushing on first failure — will retry next time
        break
      }
    }
  }, [eventId])

  return { bufferLocation, flushBuffer }
}