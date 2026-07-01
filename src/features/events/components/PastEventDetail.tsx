import { useNavigate } from 'react-router-dom'
import { RaceEvent, CANCEL_REASONS } from '../types'
import { C, F, screenPad } from '../../../shared/ds'

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

const fmtDuration = (a: string, b: string): string => {
  const s   = Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 1000)
  const h   = Math.floor(s / 3600)
  const m   = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`
}

const fmtPace = (spm: number): string => {
  const spu = spm / (1609.344 / 1000)
  const m = Math.floor(spu / 60)
  const s = Math.round(spu % 60)
  return `${m}:${String(s).padStart(2, '0')} /km`
}

const fmtElev = (meters: number | null): string => {
  if (meters === null) return '—'
  return `${Math.round(meters)}m`
}

interface Props { event: RaceEvent }

export const PastEventDetail = ({ event }: Props) => {
  const navigate  = useNavigate()
  const isFinished = event.status === 'Finished'
  const isCancelled = event.status === 'Cancelled'
  const cancelLabel = isCancelled && event.cancelReason
    ? CANCEL_REASONS.find((r) => r.value === event.cancelReason)?.label
    : null

  const duration   = event.startedAt && event.finishedAt ? fmtDuration(event.startedAt, event.finishedAt) : null
  const avgPace    = event.lastLocation?.averagePaceSecondsPerMile ?? null
  const distCovered = event.lastLocation?.distanceFromStart ?? null
  const distKm     = event.route.totalDistance ? `${(event.route.totalDistance / 1000).toFixed(1)} km` : '—'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', backgroundColor: C.base }}>

      {/* Back row */}
      <div style={{ padding: `16px ${screenPad}px 0`, flexShrink: 0 }}>
        <button
          onClick={() => navigate('/events/past')}
          style={{ background: 'none', border: 'none', color: C.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: F.ui, fontSize: 14, padding: '4px 0' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Events
        </button>
      </div>

      {/* Route name + date */}
      <div style={{ padding: `14px ${screenPad}px 0` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <h1 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', color: C.textPrimary, margin: 0, flex: 1 }}>
            {event.route.name}
          </h1>
          {isFinished && (
            <span style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, color: C.volt, background: 'rgba(200,249,78,0.12)', padding: '3px 7px', borderRadius: 6, letterSpacing: '.06em', flexShrink: 0, marginTop: 4 }}>
              PR
            </span>
          )}
        </div>
        <p style={{ fontFamily: F.ui, fontSize: 13, color: C.textSecondary, margin: '6px 0 0' }}>
          {fmtDate(event.createdAt)}{event.lastLocation ? ` · ${distKm}` : ''}
        </p>
      </div>

      {/* Cancelled notice */}
      {isCancelled && (
        <div style={{ margin: `12px ${screenPad}px 0`, padding: '12px 16px', background: 'rgba(255,82,71,.1)', border: `1px solid rgba(255,82,71,.25)`, borderRadius: 12 }}>
          <p style={{ fontFamily: F.ui, fontSize: 13, color: C.red, margin: 0 }}>
            Cancelled{cancelLabel ? ` — ${cancelLabel}` : ''}
          </p>
        </div>
      )}

      {/* Finish time card */}
      {duration && (
        <div style={{ margin: `16px ${screenPad}px 0`, padding: '20px 22px', background: C.surface, border: `1px solid ${C.hairline}`, borderRadius: 18 }}>
          <p style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, letterSpacing: '.13em', textTransform: 'uppercase', color: C.textTertiary, margin: '0 0 6px' }}>
            Finish time
          </p>
          <div style={{ fontFamily: F.display, fontSize: 50, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: isFinished ? C.volt : C.textPrimary, letterSpacing: '-.02em', lineHeight: 1 }}>
            {duration}
          </div>
        </div>
      )}

      {/* 3-cell stat strip */}
      <div style={{ display: 'flex', margin: `12px ${screenPad}px 0`, background: C.surface, border: `1px solid ${C.hairline}`, borderRadius: 16, overflow: 'hidden' }}>
        <StatCell label="Distance" value={distCovered ? `${(distCovered / 1000).toFixed(1)} km` : '—'} />
        <div style={{ width: 1, background: C.hairline }} />
        <StatCell label="Avg pace" value={avgPace !== null ? fmtPace(avgPace) : '—'} />
        <div style={{ width: 1, background: C.hairline }} />
        <StatCell label="Gain" value={fmtElev(event.route.elevationGainMeters)} />
      </div>

      {/* Timeline */}
      <div style={{ margin: `16px ${screenPad}px 0`, background: C.surface, border: `1px solid ${C.hairline}`, borderRadius: 16, overflow: 'hidden' }}>
        <p style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, letterSpacing: '.13em', textTransform: 'uppercase', color: C.textTertiary, margin: 0, padding: '14px 16px 8px' }}>
          Timeline
        </p>
        <TimeRow label="Created" value={fmtTime(event.createdAt)} />
        {event.startedAt && <TimeRow label="Start line" value={fmtTime(event.startedAt)} />}
        {event.finishedAt && <TimeRow label="Finish line" value={fmtTime(event.finishedAt)} last />}
        {event.endedAt && !event.finishedAt && <TimeRow label="Ended" value={fmtTime(event.endedAt)} last />}
      </div>

      {/* Share recap */}
      {isFinished && (
        <div style={{ padding: `16px ${screenPad}px 28px`, marginTop: 'auto' }}>
          <button style={{
            width: '100%', padding: '14px', borderRadius: 16, border: 'none',
            background: C.volt, color: C.base, fontFamily: F.ui, fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}>
            Share recap
          </button>
        </div>
      )}
    </div>
  )
}

const StatCell = ({ label, value }: { label: string; value: string }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 8px', gap: 4 }}>
    <span style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.textTertiary }}>
      {label}
    </span>
    <span style={{ fontFamily: F.display, fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: value === '—' ? C.textTertiary : C.textPrimary }}>
      {value}
    </span>
  </div>
)

const TimeRow = ({ label, value, last }: { label: string; value: string; last?: boolean }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', borderTop: `1px solid ${C.hairline}` }}>
    <span style={{ fontFamily: F.ui, fontSize: 13, color: C.textSecondary }}>{label}</span>
    <span style={{ fontFamily: F.mono, fontSize: 13, fontWeight: 700, color: last ? C.textPrimary : C.textSecondary }}>
      {value}
    </span>
  </div>
)
