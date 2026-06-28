import { C, F } from '../../../shared/ds'
import { EventStatus } from '../types'

const STATUS: Record<EventStatus, { label: string; color: string; softBg: string }> = {
  Pending:   { label: 'Pending',   color: C.amber, softBg: 'rgba(255,182,39,.13)' },
  Active:    { label: 'LIVE',      color: C.volt,  softBg: 'rgba(200,249,78,.13)' },
  Finished:  { label: 'Finished',  color: C.textSecondary, softBg: 'rgba(152,160,172,.1)' },
  Cancelled: { label: 'Cancelled', color: C.red,   softBg: 'rgba(255,82,71,.12)'  },
  Ended:     { label: 'Ended',     color: C.textTertiary, softBg: 'rgba(92,99,110,.1)' },
}

export const EventStatusBadge = ({ status }: { status: EventStatus }) => {
  const s = STATUS[status]
  const isLive = status === 'Active'
  return (
    <span style={{
      display:       'inline-flex',
      alignItems:    'center',
      gap:           6,
      padding:       '5px 12px',
      borderRadius:  100,
      background:    s.softBg,
      fontFamily:    F.ui,
      fontSize:      12,
      fontWeight:    700,
      color:         s.color,
      letterSpacing: '.04em',
    }}>
      <span style={{
        width:        6,
        height:       6,
        borderRadius: '50%',
        background:   s.color,
        flexShrink:   0,
        animation:    isLive ? 'rsBlink 1.2s infinite' : 'none',
      }} />
      {s.label}
    </span>
  )
}
