import { useNavigate } from 'react-router-dom'
import { RaceEvent } from '../types'
import { C, F, screenPad, btnVolt } from '../../../shared/ds'
import { useUnits } from '../../../shared/hooks/useUnits'

const fmtTime = (startedAt: string, finishedAt: string): string => {
  const s = Math.floor((new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`
}

const fmtPace = (startedAt: string, finishedAt: string, totalMeters: number): string => {
  if (!totalMeters) return '—'
  const s = Math.floor((new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 1000)
  const spm = s / (totalMeters / 1000)
  const m = Math.floor(spm / 60)
  const sec = Math.round(spm % 60)
  return `${m}:${String(sec).padStart(2, '0')} /km`
}

const fmtDist = (m: number, metric: boolean) =>
  metric ? `${(m / 1000).toFixed(1)} km` : `${(m / 1609.344).toFixed(1)} mi`

const monthKey = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

interface Group {
  month: string
  events: RaceEvent[]
}

const groupByMonth = (events: RaceEvent[]): Group[] => {
  const map = new Map<string, RaceEvent[]>()
  for (const e of events) {
    const key = monthKey(e.createdAt)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(e)
  }
  return Array.from(map.entries()).map(([month, evts]) => ({ month, events: evts }))
}

interface PastEventListProps {
  events: RaceEvent[]
  isLoading: boolean
}

export const PastEventList = ({ events, isLoading}: PastEventListProps) => {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div style={centerStyle}>
        <p style={{ fontFamily: F.ui, color: C.textSecondary }}>Loading events...</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div style={{ ...centerStyle, gap: 16 }}>
        <p style={{ fontFamily: F.ui, fontSize: 14, color: C.textSecondary }}>No past events yet.</p>
        <button onClick={() => navigate('/routes')} style={{ ...btnVolt, width: 'auto', padding: '12px 24px' }}>
          Start your first race
        </button>
      </div>
    )
  }

  const groups = groupByMonth(events)

  return (
    <div style={{ padding: `0 ${screenPad}px` }}>
      {groups.map(({ month, events: evts }) => (
        <div key={month}>
          <p style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 700, color: C.textTertiary, margin: '16px 0 8px' }}>
            {month}
          </p>
          {evts.map((event, i) => (
            <EventRow
              key={event.id}
              event={event}
              isLast={i === evts.length - 1}
              onClick={() => navigate(`/events/past/${event.id}`)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

const EventRow = ({ event, isLast, onClick }: { event: RaceEvent; isLast: boolean; onClick: () => void }) => {
  const { useMetric } = useUnits()
  const hasTime = !!(event.startedAt && event.finishedAt)
  const time    = hasTime ? fmtTime(event.startedAt!, event.finishedAt!) : null
  const pace    = hasTime ? fmtPace(event.startedAt!, event.finishedAt!, event.route.totalDistance) : null
  const dateStr = new Date(event.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const dist  = event.route.totalDistance ? event.route.totalDistance : null

  return (
    <div
      onClick={onClick}
      style={{
        display:       'flex',
        alignItems:    'center',
        justifyContent: 'space-between',
        padding:       '13px 0',
        borderBottom:  isLast ? 'none' : `1px solid ${C.hairline}`,
        cursor:        'pointer',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: C.textPrimary }}>
            {event.route.name}
          </span>
          {event.status === 'Finished' && (
            <span style={{
              fontFamily: F.ui, fontSize: 10, fontWeight: 700,
              color: C.volt, background: 'rgba(200,249,78,0.12)',
              padding: '2px 6px', borderRadius: 4, letterSpacing: '.06em',
            }}>
              PR
            </span>
          )}
        </div>
        <span style={{ fontFamily: F.ui, fontSize: 12, color: C.textSecondary }}>
          {dateStr}{dist ? ` · ${fmtDist(dist, useMetric)}` : ''}
        </span>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {time && (
          <div style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: C.textPrimary }}>
            {time}
          </div>
        )}
        {pace && (
          <div style={{ fontFamily: F.ui, fontSize: 11, color: C.textSecondary, marginTop: 2 }}>
            {pace}
          </div>
        )}
        {!hasTime && (
          <span style={{ fontFamily: F.ui, fontSize: 12, color: C.textTertiary }}>
            {event.status}
          </span>
        )}
      </div>
    </div>
  )
}

const centerStyle: React.CSSProperties = {
  display:        'flex',
  flexDirection:  'column',
  alignItems:     'center',
  justifyContent: 'center',
  padding:        '48px 24px',
}
