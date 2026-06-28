import { useCallback, useRef } from 'react'
import { Marker } from 'react-map-gl/mapbox'
import { Waypoint } from '../types'

interface WaypointMarkerProps {
  waypoint: Waypoint
  index: number
  totalCount: number
  isSelected: boolean
  onSelect: (id: string) => void
  onDragEnd: (id: string, coordinates: [number, number]) => void
}

export const WaypointMarker = ({
  waypoint,
  index,
  totalCount,
  isSelected,
  onSelect,
  onDragEnd,
}: WaypointMarkerProps) => {
  const dragStarted = useRef(false)

  const isStart = index === 0
  const isFinish = index === totalCount - 1

  const label = isStart ? 'S' : isFinish ? 'F' : `${index + 1}`

  const bgColor = isStart
    ? '#22c55e'  // green
    : isFinish
    ? '#ef4444'  // red
    : '#3b82f6'  // blue

  const handleDragEnd = useCallback(
    (e: { lngLat: { lng: number; lat: number } }) => {
      dragStarted.current = false
      onDragEnd(waypoint.id, [e.lngLat.lng, e.lngLat.lat])
    },
    [waypoint.id, onDragEnd]
  )

  const handleClick = useCallback(() => {
    // Suppress click if this was actually a drag
    if (!dragStarted.current) onSelect(waypoint.id)
  }, [waypoint.id, onSelect])

  return (
    <Marker
      longitude={waypoint.coordinates[0]}
      latitude={waypoint.coordinates[1]}
      draggable
      onDragStart={() => { dragStarted.current = true }}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: bgColor,
          border: isSelected ? '3px solid white' : '2px solid white',
          boxShadow: isSelected
            ? '0 0 0 2px ' + bgColor + ', 0 2px 6px rgba(0,0,0,0.4)'
            : '0 2px 4px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 700,
          fontSize: 13,
          cursor: 'grab',
          userSelect: 'none',
          transform: isSelected ? 'scale(1.2)' : 'scale(1)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        {label}
      </div>
    </Marker>
  )
}