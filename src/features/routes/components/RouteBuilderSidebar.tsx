import { useRef } from 'react'
import { useRouteBuilder } from '../hooks/useRouteBuilder'
import { useNavigate } from 'react-router-dom'

const formatDistance = (meters: number, useMetric: boolean): string => {
  if (useMetric) {
    const km = meters / 1000
    return `${km.toFixed(2)} km`
  }
  const miles = meters / 1609.344
  return `${miles.toFixed(2)} mi`
}

interface RouteBuilderSidebarProps {
  useMetric: boolean
  onClose: () => void
  onCancel: () => void
}

export const RouteBuilderSidebar = ({
  useMetric = false,
  onClose,
  onCancel
}: RouteBuilderSidebarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const {
    draftRoute,
    orderedWaypoints,
    isDirty,
    isSaving,
    error,
    selectedWaypointId,
    setName,
    setSelectedWaypoint,
    handleRemoveWaypoint,
    handleSave,
    handleDelete,
    importFile,
  } = useRouteBuilder()

  if (!draftRoute) return null

  const isEditing = !!draftRoute.id

  return (
    <div style={{
      width: 300,
      height: '100%',
      backgroundColor: '#1e1e2e',
      color: '#e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      gap: '16px',
      overflowY: 'auto',
      boxSizing: 'border-box',
    }}>

      {/* Header with close button */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            {isEditing ? 'Edit Route' : 'New Route'}
          </h2>
          {draftRoute.totalDistance > 0 && (
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8' }}>
              {formatDistance(draftRoute.totalDistance, useMetric)}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: 22,
            cursor: 'pointer',
            lineHeight: 1,
            padding: '0 2px',
            flexShrink: 0,
          }}
          title="Close panel"
        >
          ✕
        </button>
      </div>

      {/* Route name */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 13, color: '#94a3b8' }}>Route Name</label>
        <input
          type="text"
          value={draftRoute.name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Morning Half Marathon"
          style={{
            padding: '8px 10px',
            borderRadius: 6,
            border: '1px solid #334155',
            backgroundColor: '#0f172a',
            color: '#e2e8f0',
            fontSize: 14,
            outline: 'none',
          }}
        />
      </div>

      {/* GPX/KML import */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".gpx,.kml"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) importFile(file)
            e.target.value = ''
          }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={secondaryButtonStyle}
        >
          Import GPX / KML
        </button>
      </div>

      {/* Waypoint list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <label style={{ fontSize: 13, color: '#94a3b8' }}>
          Waypoints ({orderedWaypoints.length})
        </label>

        {orderedWaypoints.length === 0 && (
          <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>
            Click the map to add waypoints
          </p>
        )}

        {orderedWaypoints.map((wp, i) => {
          const isStart = i === 0
          const isFinish = i === orderedWaypoints.length - 1
          const isSelected = selectedWaypointId === wp.id
          const label = isStart ? 'Start' : isFinish ? 'Finish' : `Waypoint ${i + 1}`

          return (
            <div
              key={wp.id}
              onClick={() => setSelectedWaypoint(isSelected ? null : wp.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: 6,
                backgroundColor: isSelected ? '#1e3a5f' : '#0f172a',
                border: `1px solid ${isSelected ? '#3b82f6' : '#1e293b'}`,
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: isStart ? '#22c55e' : isFinish ? '#ef4444' : '#3b82f6',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 13 }}>{label}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveWaypoint(wp.id)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: 16,
                  lineHeight: 1,
                  padding: '0 2px',
                }}
                title="Remove waypoint"
              >
                ×
              </button>
            </div>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <p style={{
          margin: 0,
          padding: '8px 10px',
          backgroundColor: '#450a0a',
          border: '1px solid #991b1b',
          borderRadius: 6,
          fontSize: 13,
          color: '#fca5a5',
        }}>
          {error}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={async () => { 
            const success = await handleSave()
            if (success) navigate('/routes')
          }}
          disabled={isSaving || !isDirty}
          style={primaryButtonStyle(isSaving || !isDirty)}
        >
          {isSaving ? 'Saving...' : 'Save Route'}
        </button>
        <button
          onClick={onCancel}
          disabled={isSaving}
          style={secondaryButtonStyle}
        >
          Cancel
        </button>
        {isEditing && (
          <button
            onClick={async () => { await handleDelete(); onClose() }}
            disabled={isSaving}
            style={dangerButtonStyle(isSaving)}
          >
            Delete Route
          </button>
        )}
      </div>
    </div>
  )
}

// --- Styles ---

const primaryButtonStyle = (disabled: boolean): React.CSSProperties => ({
  padding: '10px',
  borderRadius: 6,
  border: 'none',
  backgroundColor: disabled ? '#1e3a5f' : '#3b82f6',
  color: disabled ? '#475569' : 'white',
  fontWeight: 600,
  fontSize: 14,
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'background-color 0.15s ease',
})

const secondaryButtonStyle: React.CSSProperties = {
  padding: '10px',
  borderRadius: 6,
  border: '1px solid #334155',
  backgroundColor: 'transparent',
  color: '#94a3b8',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
}

const dangerButtonStyle = (disabled: boolean): React.CSSProperties => ({
  padding: '10px',
  borderRadius: 6,
  border: '1px solid #991b1b',
  backgroundColor: 'transparent',
  color: disabled ? '#475569' : '#ef4444',
  fontWeight: 600,
  fontSize: 14,
  cursor: disabled ? 'not-allowed' : 'pointer',
})