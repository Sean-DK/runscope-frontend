import { useSpectatorStore } from '../store/spectatorStore'
import { C, F, screenPad } from '../../../shared/ds'
import { CANCEL_REASONS } from '../../events/types'
import { useState, useEffect, useRef } from 'react'

const MILE = 1609.344
const KM   = 1000

const fmtPace = (spm: number | null, metric: boolean): string => {
  if (spm === null) return '—'
  const spu = metric ? spm / (MILE / KM) : spm
  const m   = Math.floor(spu / 60)
  const s   = Math.round(spu % 60)
  return `${m}:${String(s).padStart(2, '0')}${metric ? '/km' : '/mi'}`
}

const fmtElapsed = (seconds: number | null): string => {
  if (seconds === null) return '—'
  const h   = Math.floor(seconds / 3600)
  const m   = Math.floor((seconds % 3600) / 60)
  const s   = seconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

const fmtDist = (meters: number | null, metric: boolean): string => {
  if (meters === null) return '—'
  return metric
    ? `${(meters / KM).toFixed(2)} km`
    : `${(meters / MILE).toFixed(2)} mi`
}

const fmtETA = (ts: string | null): string => {
  if (!ts) return '—'
  return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

const getElapsedSeconds = (startedAt: string | null, finishedAt: string | null): number | null => {
  if (!startedAt) return null
  const start = new Date(startedAt).getTime()
  const end = finishedAt ? new Date(finishedAt).getTime() : Date.now()
  return Math.floor((end - start) / 1000)
}

interface SpectatorStatsProps {
  useMetric: boolean
}

export const SpectatorStats = ({ useMetric }: SpectatorStatsProps) => {
  const { event, stats, connectionStatus } = useSpectatorStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [liveElapsed, setLiveElapsed] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
  
    if (!event?.startedAt) {
      setLiveElapsed(null)
      return
    }
  
    const stopAt = event.finishedAt ?? event.endedAt ?? null
  
    setLiveElapsed(getElapsedSeconds(event.startedAt, stopAt))
  
    if (!stopAt) {
      timerRef.current = setInterval(() => {
        setLiveElapsed(getElapsedSeconds(event.startedAt!, null))
      }, 1000)
    }
  
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [event?.startedAt, event?.finishedAt, event?.endedAt])

  if (!event) return null

  const isCancelled = event.status === 'Cancelled'
  const isFinished  = event.status === 'Finished' || event.status === 'Ended'
  const totalDist   = event.route.totalDistance ?? 0
  const remaining   = stats.distanceRemainingMeters ?? totalDist
  const covered     = Math.max(0, totalDist - remaining)
  const pct         = totalDist > 0 ? Math.min(1, covered / totalDist) : 0

  const distCovered    = fmtDist(covered, useMetric)
  const distRemaining  = fmtDist(remaining, useMetric)
  const distTotal      = fmtDist(totalDist, useMetric)
  const avgPace        = fmtPace(stats.averagePaceSecondsPerMile, useMetric)
  const currPace       = fmtPace(stats.currentPaceSecondsPerMile, useMetric)
  const elapsed        = fmtElapsed(liveElapsed)
  const estFinish      = fmtElapsed((stats.elapsedSeconds ?? 0) + (stats.estimatedFinishSeconds ?? 0))
  const targetFinish   = fmtElapsed(event.targetTimeSeconds)
  const prFinish       = fmtElapsed(event.prTimeSeconds)
  const eta            = fmtETA(stats.estimatedFinishTimestamp)

  const cancelReasonLabel = event.cancelReason
    ? CANCEL_REASONS.find(r => r.value === event.cancelReason)?.label ?? event.cancelReason
    : 'Unknown reason'

  const statCells = [
    { label: 'Average pace',    value: avgPace },
    { label: 'Elapsed',         value: elapsed },
    { label: 'Current pace',    value: currPace },
    { label: 'Target finish',   value: targetFinish },
    { label: 'PR',              value: prFinish },
    { label: 'Est. finish',     value: estFinish, highlight: true },
  ]

  return (
    <div style={{
      backgroundColor: C.base,
      display:         'flex',
      flexDirection:   'column',
      height:          '100%',
    }}>
      <div style={{
        position:       'absolute',
        bottom:         0,
        left:           0,
        right:          0,
        zIndex:         20,
        background:     'rgba(10,11,13,0.88)',
        backdropFilter: 'blur(18px)',
        borderRadius:   '20px 20px 0 0',
        border:         `1px solid ${C.hairline}`,
        borderBottom:   'none',
      }}>
        <div
          onClick={() => setDrawerOpen((o) => !o)}
          style={{ padding: '12px 20px 0px', cursor: 'pointer' }}
        >
          {/* Handle pill */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)' }} />
          </div>

          {/* Cancellation summary — replaces progress card */}
          {isCancelled ? (
            <div style={{ margin: '0 16px 12px', padding: '18px 20px', background: C.surface, border: `1px solid ${C.hairline}`, borderRadius: 16 }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  width:          36,
                  height:         36,
                  borderRadius:   10,
                  background:     'rgba(255,82,71,.12)',
                  border:         '1px solid rgba(255,82,71,.2)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  flexShrink:     0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontFamily: F.ui, fontSize: 12, fontWeight: 700, color: C.red, margin: '0 0 2px', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                    Race stopped
                  </p>
                  <p style={{ fontFamily: F.ui, fontSize: 13, color: C.textSecondary, margin: 0 }}>
                    {cancelReasonLabel}
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: C.elevated, borderRadius: 12, padding: '12px 14px' }}>
                  <p style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.textTertiary, margin: '0 0 4px' }}>
                    Distance covered
                  </p>
                  <p style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: 0, letterSpacing: '-.01em' }}>
                    {distCovered}
                  </p>
                </div>
                <div style={{ background: C.elevated, borderRadius: 12, padding: '12px 14px' }}>
                  <p style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.textTertiary, margin: '0 0 4px' }}>
                    Time elapsed
                  </p>
                  <p style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: 0, fontVariantNumeric: 'tabular-nums', letterSpacing: '-.01em' }}>
                    {elapsed}
                  </p>
                </div>
              </div>
            </div>
          ) : isFinished ? (
            /* Finished summary — replaces progress card */
            <div style={{ margin: '0 16px 12px', padding: '18px 20px', background: C.surface, border: `1px solid ${C.hairline}`, borderRadius: 16 }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  width:          36,
                  height:         36,
                  borderRadius:   10,
                  background:     'rgba(82,255,71,.12)',
                  border:         '1px solid rgba(82,255,71,.2)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  flexShrink:     0,
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#52ff47" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontFamily: F.ui, fontSize: 12, fontWeight: 700, color: C.green, margin: '0 0 2px', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                    Race finished
                  </p>
                  <p style={{ fontFamily: F.ui, fontSize: 13, color: C.textSecondary, margin: 0 }}>
                    {distTotal}
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: C.elevated, borderRadius: 12, padding: '12px 14px' }}>
                  <p style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.textTertiary, margin: '0 0 4px' }}>
                    Average pace
                  </p>
                  <p style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: 0, letterSpacing: '-.01em' }}>
                    {avgPace}
                  </p>
                </div>
                <div style={{ background: C.elevated, borderRadius: 12, padding: '12px 14px' }}>
                  <p style={{ fontFamily: F.ui, fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.textTertiary, margin: '0 0 4px' }}>
                    Time elapsed
                  </p>
                  <p style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: 0, fontVariantNumeric: 'tabular-nums', letterSpacing: '-.01em' }}>
                    {elapsed}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Normal progress card */
            totalDist > 0 && (
              <div style={{ margin: '0px 16px 0px 16px', padding: '0px 16px', zIndex: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontFamily: F.ui, fontSize: 13, color: C.textSecondary }}>
                    Distance to finish
                  </span>
                  <span style={{ fontFamily: F.display, fontSize: 13, fontWeight: 600, color: C.volt }}>
                    ETA {eta}
                  </span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontFamily: F.display, fontSize: 36, fontWeight: 600, color: C.textPrimary }}>
                    {distRemaining}
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: C.elevated, overflow: 'hidden', marginBottom: 4 }}>
                  <div style={{ height: '100%', width: `${pct * 100}%`, background: C.volt, borderRadius: 4, transition: 'width .5s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontFamily: F.ui, fontSize: 11, color: C.textSecondary }}>{distCovered} done</span>
                  <span style={{ fontFamily: F.ui, fontSize: 11, color: C.textSecondary }}>{distTotal} total</span>
                </div>
              </div>
            )
          )}

          {/* Collapsible stat cards — hidden when cancelled */}
          {!isCancelled && (
            <div style={{
              maxHeight:  drawerOpen ? '400px' : '0px',
              overflow:   'hidden',
              transition: 'max-height 0.35s cubic-bezier(.4,0,.2,1)',
            }}>
              <div style={{
                display:             'grid',
                gridTemplateColumns: '1fr 1fr',
                gap:                 10,
                padding:             `16px ${screenPad}px`,
              }}>
                {statCells.map(({ label, value, highlight }) => (
                  <StatCard key={label} label={label} value={value} highlight={!!highlight} />
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ padding: `0 ${screenPad}px 8px`, textAlign: 'center' }}>
            <p style={{ fontFamily: F.ui, fontSize: 11, color: C.textTertiary, margin: 0 }}>
              {isCancelled
                ? 'This event has ended'
                : connectionStatus === 'Connected'
                ? 'Auto-refresh · updates in real time'
                : connectionStatus === 'Reconnecting'
                ? 'Reconnecting...'
                : 'Connection lost'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ label, value, highlight }: { label: string; value: string; highlight: boolean }) => (
  <div style={{
    background:   highlight ? 'transparent' : C.surface,
    border:       `1px solid ${highlight ? C.volt : C.hairline}`,
    borderRadius: 16,
    padding:      '14px 16px',
  }}>
    <p style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: highlight ? C.volt : C.textTertiary, margin: '0 0 6px' }}>
      {label}
    </p>
    <p style={{
      fontFamily:         F.display,
      fontSize:           22,
      fontWeight:         700,
      fontVariantNumeric: 'tabular-nums',
      color:              highlight ? C.volt : (value === '—' ? C.textTertiary : C.textPrimary),
      margin:             0,
      letterSpacing:      '-.01em',
    }}>
      {value}
    </p>
  </div>
)