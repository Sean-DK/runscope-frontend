import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEventHost } from '../features/events/hooks/useEventHost'
import { useUnits } from '../shared/hooks/useUnits'
import { routesApi } from '../features/routes/api'
import { Route } from '../features/routes/types'
import { fetchClient } from '../shared/utils/fetchClient'
import { C, F, screenPad } from '../shared/ds'

const formatDistance = (meters: number, useMetric: boolean): string =>
  useMetric
    ? `${(meters / 1000).toFixed(2)} km`
    : `${(meters / 1609.344).toFixed(2)} mi`

const fmtTime = (seconds: number): string => {
  const h   = Math.floor(seconds / 3600)
  const m   = Math.floor((seconds % 3600) / 60)
  const s   = seconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

interface PersonalRecord {
  distance:    string
  timeSeconds: number
}

const PR_LABELS: Record<string, string> = {
  OneMile:      '1 Mile',
  FiveK:        '5K',
  FiveMile:     '5 Mile',
  TenK:         '10K',
  HalfMarathon: 'Half Marathon',
  Marathon:     'Marathon',
}

// ── Shared step wrapper ────────────────────────────────────
const StepShell = ({
  title,
  subtitle,
  onBack,
  children,
}: {
  title:     string
  subtitle?: string
  onBack:    () => void
  children:  React.ReactNode
}) => (
  <div style={{
    flex:          1,
    display:       'flex',
    flexDirection: 'column',
    padding:       `24px ${screenPad}px 32px`,
    gap:           20,
    overflowY:     'auto',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.textSecondary, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div>
        <h1 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', color: C.textPrimary, margin: 0 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontFamily: F.ui, fontSize: 13, color: C.textSecondary, margin: '2px 0 0' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {children}
  </div>
)

// ── Keypad ─────────────────────────────────────────────────
const TimeKeypad = ({
  onPush,
  onBack,
}: {
  digits:  number[]
  onPush:  (d: number) => void
  onBack:  () => void
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {[[1,2,3],[4,5,6],[7,8,9],['del',0,'']].map((row, ri) => (
      <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {row.map((k, ki) => (
          <button
            key={ki}
            onClick={() => {
              if (k === 'del') onBack()
              else if (k !== '') onPush(Number(k))
            }}
            disabled={k === ''}
            style={{
              height:         56,
              borderRadius:   12,
              border:         k === '' ? 'none' : `1px solid ${C.hairline}`,
              background:     k === '' ? 'transparent' : C.elevated,
              color:          C.textPrimary,
              fontFamily:     k === 'del' ? F.ui : F.display,
              fontSize:       k === 'del' ? 13 : 22,
              fontWeight:     k === 'del' ? 600 : 500,
              cursor:         k === '' ? 'default' : 'pointer',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
            }}
          >
            {k === 'del' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" />
              </svg>
            ) : k === '' ? null : k}
          </button>
        ))}
      </div>
    ))}
  </div>
)

// ── Time display ───────────────────────────────────────────
const TimeDisplay = ({ digits }: { digits: number[] }) => {
  const [s1, s2, m1, m2, h1, h2] = digits
  const displayH = `${h2}${h1}`
  const displayM = `${m2}${m1}`
  const displayS = `${s2}${s1}`
  const isEmpty  = digits.every(x => x === 0)

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px 0' }}>
      {[displayH, displayM, displayS].map((val, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {val.split('').map((d, j) => (
              <div key={j} style={{
                width:              52,
                height:             64,
                borderRadius:       12,
                background:         C.elevated,
                border:             `1.5px solid ${C.hairline}`,
                display:            'flex',
                alignItems:         'center',
                justifyContent:     'center',
                fontFamily:         F.display,
                fontSize:           32,
                fontWeight:         700,
                fontVariantNumeric: 'tabular-nums',
                color:              isEmpty ? C.textTertiary : C.textPrimary,
              }}>
                {d}
              </div>
            ))}
          </div>
          {i < 2 && (
            <span style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, color: C.textTertiary, marginBottom: 4 }}>:</span>
          )}
        </div>
      ))}
    </div>
  )
}

// ── PR chips ───────────────────────────────────────────────
const PrChips = ({
  prs,
  selectedSeconds,
  onSelect,
}: {
  prs:             PersonalRecord[]
  selectedSeconds: number | null
  onSelect:        (seconds: number) => void
}) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
    {Object.keys(PR_LABELS)
      .filter((key) => prs.some((pr) => pr.distance === key))
      .map((key) => {
        const pr       = prs.find((p) => p.distance === key)!
        const isActive = selectedSeconds === pr.timeSeconds
        return (
          <button
            key={key}
            onClick={() => onSelect(pr.timeSeconds)}
            style={{
              padding:       '8px 14px',
              borderRadius:  100,
              border:        `1px solid ${isActive ? C.volt : C.hairline}`,
              background:    isActive ? 'rgba(200,249,78,0.1)' : C.elevated,
              cursor:        'pointer',
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              gap:           2,
            }}
          >
            <span style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, color: isActive ? C.volt : C.textTertiary }}>
              {PR_LABELS[key]}
            </span>
            <span style={{ fontFamily: F.display, fontSize: 14, fontWeight: 700, color: isActive ? C.volt : C.textSecondary, fontVariantNumeric: 'tabular-nums' }}>
              {fmtTime(pr.timeSeconds)}
            </span>
          </button>
        )
      })}
  </div>
)

// ── Step 2: Target time ────────────────────────────────────
const TargetTimeStep = ({
  prs,
  initial,
  onNext,
  onBack,
  onSkip,
}: {
  prs:     PersonalRecord[]
  initial: number | null
  onNext:  (seconds: number | null) => void
  onBack:  () => void
  onSkip:  () => void
}) => {
  const toDigits = (seconds: number): number[] => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return [s % 10, Math.floor(s / 10), m % 10, Math.floor(m / 10), h % 10, Math.floor(h / 10)]
  }

  const [digits, setDigits] = useState<number[]>(initial ? toDigits(initial) : [0,0,0,0,0,0])

  const [s1, s2, m1, m2, h1, h2] = digits
  const totalSeconds = parseInt(`${h2}${h1}`) * 3600 + parseInt(`${m2}${m1}`) * 60 + parseInt(`${s2}${s1}`)
  const isValid = totalSeconds > 0

  return (
    <StepShell title="Target time" subtitle="Optional — set a goal to race against." onBack={onBack}>
      {prs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.textTertiary, margin: 0, textAlign: 'center' }}>
            Load from PR
          </p>
          <PrChips
            prs={prs}
            selectedSeconds={isValid ? totalSeconds : null}
            onSelect={(s) => setDigits(toDigits(s))}
          />
        </div>
      )}

      <TimeDisplay digits={digits} />

      <TimeKeypad
        digits={digits}
        onPush={(d) => setDigits((prev) => [d, ...prev.slice(0, 5)])}
        onBack={() => setDigits((prev) => [...prev.slice(1), 0])}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
        <button
          onClick={() => onNext(isValid ? totalSeconds : null)}
          style={{
            padding:      '15px',
            borderRadius: 14,
            border:       'none',
            background:   C.volt,
            color:        C.base,
            fontFamily:   F.ui,
            fontSize:     15,
            fontWeight:   700,
            cursor:       'pointer',
          }}
        >
          {isValid ? 'Next' : 'Skip'}
        </button>
        {isValid && (
          <button onClick={onSkip} style={{ padding: '12px', borderRadius: 14, border: 'none', background: 'none', color: C.textTertiary, fontFamily: F.ui, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Skip without a target
          </button>
        )}
      </div>
    </StepShell>
  )
}

// ── Step 3: PR selection ───────────────────────────────────
const PrStep = ({
  prs,
  initial,
  onNext,
  onBack,
  onSkip,
}: {
  prs:     PersonalRecord[]
  initial: number | null
  onNext:  (seconds: number | null) => void
  onBack:  () => void
  onSkip:  () => void
}) => {
  const [selected, setSelected] = useState<number | null>(initial)

  return (
    <StepShell title="Share your PR" subtitle="Let spectators see how you compare to your best." onBack={onBack}>
      {prs.length === 0 ? (
        <div style={{ padding: '20px', background: C.surface, borderRadius: 14, border: `1px solid ${C.hairline}`, textAlign: 'center' }}>
          <p style={{ fontFamily: F.ui, fontSize: 14, color: C.textSecondary, margin: 0 }}>
            You haven't set any PRs yet. Add them on the You page.
          </p>
        </div>
      ) : (
        <PrChips
          prs={prs}
          selectedSeconds={selected}
          onSelect={(s) => setSelected((prev) => prev === s ? null : s)}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
        <button
          onClick={() => onNext(selected)}
          style={{
            padding:      '15px',
            borderRadius: 14,
            border:       'none',
            background:   C.volt,
            color:        C.base,
            fontFamily:   F.ui,
            fontSize:     15,
            fontWeight:   700,
            cursor:       'pointer',
          }}
        >
          {selected !== null ? 'Next' : 'Skip'}
        </button>
        {selected !== null && (
          <button onClick={onSkip} style={{ padding: '12px', borderRadius: 14, border: 'none', background: 'none', color: C.textTertiary, fontFamily: F.ui, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Skip without sharing a PR
          </button>
        )}
      </div>
    </StepShell>
  )
}

// ── Step 4: Confirm ────────────────────────────────────────
const ConfirmStep = ({
  route,
  targetTimeSeconds,
  prTimeSeconds,
  useMetric,
  isStarting,
  error,
  onStart,
  onBack,
}: {
  route:             Route
  targetTimeSeconds: number | null
  prTimeSeconds:     number | null
  useMetric:         boolean
  isStarting:        boolean
  error:             string | null
  onStart:           () => void
  onBack:            () => void
}) => (
  <StepShell title="Ready to race?" onBack={onBack}>
    {/* Summary card */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.hairline}` }}>
      <SummaryRow label="Route" value={route.name} />
      <SummaryRow label="Distance" value={formatDistance(route.totalDistance, useMetric)} />
      <SummaryRow label="Target time" value={targetTimeSeconds ? fmtTime(targetTimeSeconds) : '—'} highlight={!!targetTimeSeconds} />
      <SummaryRow label="Shared PR" value={prTimeSeconds ? fmtTime(prTimeSeconds) : '—'} highlight={!!prTimeSeconds} />
    </div>

    {/* Info callout */}
    <div style={{ padding: '14px 16px', background: 'rgba(59,130,246,0.08)', borderRadius: 12, border: '1px solid rgba(59,130,246,0.2)' }}>
      <p style={{ fontFamily: F.ui, fontSize: 13, color: '#93c5fd', lineHeight: 1.6, margin: 0 }}>
        Your event starts immediately so spectators can join. Your race clock won't start until you cross the start line.
      </p>
    </div>

    {error && (
      <p style={{ fontFamily: F.ui, fontSize: 13, color: C.red, margin: 0, textAlign: 'center' }}>{error}</p>
    )}

    <div style={{ marginTop: 'auto' }}>
      <button
        onClick={onStart}
        disabled={isStarting}
        style={{
          width:        '100%',
          padding:      '16px',
          borderRadius: 14,
          border:       'none',
          background:   isStarting ? C.elevated : C.volt,
          color:        isStarting ? C.textTertiary : C.base,
          fontFamily:   F.ui,
          fontWeight:   700,
          fontSize:     16,
          cursor:       isStarting ? 'not-allowed' : 'pointer',
        }}
      >
        {isStarting ? 'Starting...' : 'Start Event'}
      </button>
    </div>
  </StepShell>
)

const SummaryRow = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: C.surface, gap: 12 }}>
    <span style={{ fontFamily: F.ui, fontSize: 14, color: C.textSecondary }}>{label}</span>
    <span style={{ fontFamily: F.display, fontSize: 15, fontWeight: 600, color: highlight ? C.volt : C.textPrimary, fontVariantNumeric: 'tabular-nums' }}>
      {value}
    </span>
  </div>
)

// ── Main Page ──────────────────────────────────────────────
type Step = 'setup' | 'target' | 'pr' | 'confirm'

export const EventSetupPage = () => {
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const routeId        = searchParams.get('routeId')
  const { startEvent, isStarting, error, activeEvent } = useEventHost()
  const { useMetric }  = useUnits()

  const [route, setRoute]                       = useState<Route | null>(null)
  const [isLoading, setIsLoading]               = useState(true)
  const [loadError, setLoadError]               = useState<string | null>(null)
  const [prs, setPrs]                           = useState<PersonalRecord[]>([])
  const [step, setStep]                         = useState<Step>('setup')
  const [targetTimeSeconds, setTargetTime]      = useState<number | null>(null)
  const [prTimeSeconds, setPrTime]              = useState<number | null>(null)

  useEffect(() => {
    if (!routeId) { navigate('/routes'); return }
    Promise.all([
      routesApi.getById(routeId),
      fetchClient<PersonalRecord[]>('/api/users/me/prs').catch(() => []),
    ]).then(([r, p]) => {
      setRoute(r)
      setPrs(p)
    }).catch(() => setLoadError('Route not found.'))
      .finally(() => setIsLoading(false))
  }, [routeId, navigate])

  useEffect(() => {
    if (activeEvent) navigate(`/events/${activeEvent.id}/host`)
  }, [activeEvent, navigate])

  const handleStart = () => {
    if (routeId) startEvent(routeId, targetTimeSeconds ?? undefined, prTimeSeconds ?? undefined)
  }

  if (isLoading) {
    return (
      <div style={centerStyle}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: `2.5px solid ${C.hairline}`, borderTopColor: C.volt, animation: 'rsSpin 0.7s linear infinite' }} />
        <style>{`@keyframes rsSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (loadError || !route) {
    return (
      <div style={centerStyle}>
        <p style={{ fontFamily: F.ui, color: C.red, marginBottom: 16 }}>{loadError ?? 'Route not found.'}</p>
        <button onClick={() => navigate('/routes')} style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${C.hairline}`, background: C.elevated, color: C.textSecondary, fontFamily: F.ui, cursor: 'pointer' }}>
          Back to Routes
        </button>
      </div>
    )
  }

  if (step === 'target') {
    return (
      <TargetTimeStep
        prs={prs}
        initial={targetTimeSeconds}
        onNext={(s) => { setTargetTime(s); setStep('pr') }}
        onBack={() => setStep('setup')}
        onSkip={() => { setTargetTime(null); setStep('pr') }}
      />
    )
  }

  if (step === 'pr') {
    return (
      <PrStep
        prs={prs}
        initial={prTimeSeconds}
        onNext={(s) => { setPrTime(s); setStep('confirm') }}
        onBack={() => setStep('target')}
        onSkip={() => { setPrTime(null); setStep('confirm') }}
      />
    )
  }

  if (step === 'confirm') {
    return (
      <ConfirmStep
        route={route}
        targetTimeSeconds={targetTimeSeconds}
        prTimeSeconds={prTimeSeconds}
        useMetric={useMetric}
        isStarting={isStarting}
        error={error}
        onStart={handleStart}
        onBack={() => setStep('pr')}
      />
    )
  }

  // Step 1: Setup
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: `24px ${screenPad}px 32px`, gap: 20, color: C.textPrimary }}>

      {/* Back + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate(`/routes/${routeId}`)}
          style={{ background: 'none', border: 'none', color: C.textSecondary, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, letterSpacing: '-.01em', color: C.textPrimary, margin: 0 }}>
          Start Event
        </h1>
      </div>

      {/* Route summary card */}
      <div style={{ padding: '16px 18px', background: C.surface, borderRadius: 16, border: `1px solid ${C.hairline}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.textTertiary, margin: 0 }}>
          Selected Route
        </p>
        <p style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: 0 }}>
          {route.name}
        </p>
        <p style={{ fontFamily: F.ui, fontSize: 13, color: C.textSecondary, margin: 0 }}>
          {formatDistance(route.totalDistance, useMetric)} · {route.waypoints.length} waypoints
        </p>
      </div>

      {/* Info callout */}
      <div style={{ padding: '14px 16px', background: 'rgba(59,130,246,0.08)', borderRadius: 12, border: '1px solid rgba(59,130,246,0.2)' }}>
        <p style={{ fontFamily: F.ui, fontSize: 13, color: '#93c5fd', lineHeight: 1.6, margin: 0 }}>
          Your event starts immediately so spectators can join. Your race clock won't start until you cross the start line.
        </p>
      </div>

      {/* Actions */}
      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={() => setStep('target')}
          style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: C.volt, color: C.base, fontFamily: F.ui, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
        >
          Next
        </button>
      </div>
    </div>
  )
}

const centerStyle: React.CSSProperties = {
  flex:           1,
  display:        'flex',
  flexDirection:  'column',
  alignItems:     'center',
  justifyContent: 'center',
  gap:            12,
}