import { useEffect, useState } from 'react'
import { PastEventList } from '../features/events/components/PastEventList'
import { StatCard } from '../shared/components/StatCard'
import { C, F, screenPad } from '../shared/ds'
import { eventsApi } from '../features/events/api'
import { RaceEvent } from '../features/events/types'
import { useUnits } from '../shared/hooks/useUnits'

const MILE = 1609.344
const KM   = 1000

const fmtDist = (meters: number | null, metric: boolean): number | null => {
  if (meters === null) return null
  return metric
    ? Number((meters / KM).toFixed(2))
    : Number((meters / MILE).toFixed(2))
}

const calculateTotalDistance = (events: RaceEvent[]): number =>
  events.reduce((sum, event) => sum + event.route.totalDistance, 0)

export const PastEventsPage = () => {
  const { useMetric } = useUnits()
  const [events, setEvents] = useState<RaceEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    eventsApi.getPast()
      .then(setEvents)
      .finally(() => setIsLoading(false))
  }, [])
      
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: C.base, overflow: 'auto' }}>
      {/* Page header */}
      <div style={{ padding: `20px ${screenPad}px 16px`, flexShrink: 0 }}>
        <h1 style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, letterSpacing: '-.02em', color: C.textPrimary, margin: 0 }}>
          Events
        </h1>
      </div>
      {/* Stat cards grid */}
      <div style={{ padding: `20px ${screenPad}px`, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <StatCard
            label="Races"
            value={events.length}
            icon={<ShoeIcon />}
            onClick={() => {}}
          />
          <StatCard
            label={useMetric ? 'kilometers shared' : 'miles shared'}
            value={fmtDist(calculateTotalDistance(events), useMetric)}
            icon={<MeasureIcon />}
            onClick={() => {}}
          />
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <PastEventList 
          events={events}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

const ShoeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m15 10.42 4.8-5.07"/>
    <path d="M19 18h3"/>
    <path d="M9.5 22 21.414 9.415A2 2 0 0 0 21.2 6.4l-5.61-4.208A1 1 0 0 0 14 3v2a2 2 0 0 1-1.394 1.906L8.677 8.053A1 1 0 0 0 8 9c-.155 6.393-2.082 9-4 9a2 2 0 0 0 0 4h14"/>
  </svg>
)

const MeasureIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 15v-3"/>
    <path d="M14 15v-3"/>
    <path d="M18 15v-3"/>
    <path d="M2 8V4"/>
    <path d="M22 6H2"/>
    <path d="M22 8V4"/>
    <path d="M6 15v-3"/>
    <rect x="2" y="12" width="20" height="8" rx="2"/>
  </svg>
)