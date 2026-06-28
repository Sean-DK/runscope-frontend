import { useRef } from 'react'
import { useRouteBuilder } from '../hooks/useRouteBuilder'
import { useNavigate } from 'react-router-dom'
import { C, F } from '../../../shared/ds'

const fmtDist = (m: number, metric: boolean) =>
  metric ? `${(m / 1000).toFixed(1)} km` : `${(m / 1609.344).toFixed(1)} mi`

const estMin = (meters: number) => Math.round(meters / 1000 * 6)

interface Props { useMetric: boolean; onClose: () => void; onCancel: () => void }

export const RouteBuilderSidebar = ({ useMetric = false, onClose, onCancel }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate     = useNavigate()
  const {
    draftRoute, orderedWaypoints, isDirty, isSaving, error,
    selectedWaypointId, setName, setSelectedWaypoint,
    handleRemoveWaypoint, handleSave, handleDelete, importFile,
  } = useRouteBuilder()

  if (!draftRoute) return null

  const isEditing = !!draftRoute.id
  const dist      = draftRoute.totalDistance ?? 0

  return (
    <div style={{
      width:           280,
      height:          '100%',
      background:      'rgba(10,11,13,0.94)',
      backdropFilter:  'blur(14px)',
      borderRight:     `1px solid ${C.hairline}`,
      boxShadow:       '4px 0 24px rgba(0,0,0,0.5)',
      color:           C.textPrimary,
      display:         'flex',
      flexDirection:   'column',
      overflowY:       'auto',
      boxSizing:       'border-box',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 18px 12px' }}>
        <span style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 700, color: C.textSecondary }}>
          Building route
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textTertiary, fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 2 }}>
          ✕
        </button>
      </div>

      {/* Distance card */}
      {dist > 0 && (
        <div style={{ margin: '0 14px 16px', padding: '14px 16px', background: C.elevated, border: `1px solid ${C.hairline}`, borderRadius: 14 }}>
          <div style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, letterSpacing: '-.02em', color: C.textPrimary }}>
            {fmtDist(dist, useMetric)}
          </div>
          <div style={{ fontFamily: F.ui, fontSize: 12, color: C.textSecondary, marginTop: 3 }}>
            ≈ {estMin(dist)} min · {orderedWaypoints.length} waypoints
          </div>
        </div>
      )}

      {/* Route name */}
      <div style={{ padding: '0 14px 14px' }}>
        <input
          type="text"
          value={draftRoute.name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Route name"
          style={{
            width:        '100%',
            padding:      '10px 12px',
            borderRadius: 12,
            border:       `1px solid ${C.hairline}`,
            background:   C.elevated,
            color:        C.textPrimary,
            fontFamily:   F.ui,
            fontSize:     14,
            fontWeight:   600,
            outline:      'none',
            boxSizing:    'border-box',
          }}
        />
      </div>

      {/* Waypoint list */}
      <div style={{ flex: 1, padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        <p style={{ fontFamily: F.ui, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.textTertiary, margin: '0 0 10px' }}>
          Waypoints
        </p>

        {orderedWaypoints.length === 0 && (
          <p style={{ fontFamily: F.ui, fontSize: 13, color: C.textTertiary, margin: 0 }}>
            Tap the map to add waypoints
          </p>
        )}

        {orderedWaypoints.map((wp, i) => {
          const isStart  = i === 0
          const isFinish = i === orderedWaypoints.length - 1 && orderedWaypoints.length > 1
          const isSel    = selectedWaypointId === wp.id
          const label    = isStart ? 'Start' : isFinish ? 'Finish' : `Point ${i + 1}`

          return (
            <div key={wp.id} style={{ display: 'flex', gap: 10, alignItems: 'stretch', marginBottom: 2 }}>
              {/* Connector column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 18, flexShrink: 0 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  background: isStart ? C.textPrimary : isFinish ? C.textPrimary : C.elevated,
                  border: `2px solid ${isStart || isFinish ? C.textPrimary : C.volt}`,
                  marginTop: 8,
                }} />
                {i < orderedWaypoints.length - 1 && (
                  <div style={{ flex: 1, width: 1.5, background: C.hairline, margin: '3px 0' }} />
                )}
              </div>
              {/* Label row */}
              <div
                onClick={() => setSelectedWaypoint(isSel ? null : wp.id)}
                style={{
                  flex:         1,
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent: 'space-between',
                  padding:      '7px 10px',
                  borderRadius: 10,
                  background:   isSel ? C.elevated : 'transparent',
                  border:       `1px solid ${isSel ? C.volt : 'transparent'}`,
                  cursor:       'pointer',
                  minHeight:    36,
                }}
              >
                <span style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 600, color: isSel ? C.volt : C.textPrimary }}>
                  {label}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveWaypoint(wp.id) }}
                  style={{ background: 'none', border: 'none', color: C.textTertiary, cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px' }}
                >
                  ×
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Import */}
      <div style={{ padding: '12px 14px 0' }}>
        <input ref={fileInputRef} type="file" accept=".gpx,.kml" style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) importFile(f); e.target.value = '' }}
        />
        <button onClick={() => fileInputRef.current?.click()} style={secondaryBtn}>
          Import GPX / KML
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ margin: '10px 14px 0', padding: '10px 12px', background: 'rgba(255,82,71,.1)', border: `1px solid rgba(255,82,71,.25)`, borderRadius: 10 }}>
          <p style={{ fontFamily: F.ui, fontSize: 13, color: C.red, margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Actions */}
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={async () => { const ok = await handleSave(); if (ok) navigate('/routes') }}
          disabled={isSaving || !isDirty}
          style={{
            padding:      '14px',
            borderRadius: 14,
            border:       'none',
            background:   isSaving || !isDirty ? C.elevated : C.volt,
            color:        isSaving || !isDirty ? C.textTertiary : C.base,
            fontFamily:   F.ui,
            fontSize:     14,
            fontWeight:   700,
            cursor:       isSaving || !isDirty ? 'not-allowed' : 'pointer',
          }}
        >
          {isSaving ? 'Saving...' : 'Save route'}
        </button>
        <button onClick={onCancel} disabled={isSaving} style={secondaryBtn}>
          Cancel
        </button>
        {isEditing && (
          <button
            onClick={async () => { await handleDelete(); onClose() }}
            disabled={isSaving}
            style={{ ...secondaryBtn, borderColor: 'rgba(255,82,71,.3)', color: C.red }}
          >
            Delete route
          </button>
        )}
      </div>
    </div>
  )
}

const secondaryBtn: React.CSSProperties = {
  padding:      '11px',
  borderRadius: 12,
  border:       `1px solid ${C.hairline}`,
  background:   C.elevated,
  color:        C.textSecondary,
  fontFamily:   F.ui,
  fontSize:     13,
  fontWeight:   600,
  cursor:       'pointer',
  width:        '100%',
}
