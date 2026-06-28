import { EventStatus } from '../types'

const STATUS_CONFIG: Record<EventStatus, { label: string; color: string; bg: string }> = {
  Pending:   { label: 'Waiting to Start', color: '#fbbf24', bg: '#451a03' },
  Active:    { label: 'Active',           color: '#34d399', bg: '#022c22' },
  Finished:  { label: 'Finished',         color: '#60a5fa', bg: '#1e3a5f' },
  Cancelled: { label: 'Cancelled',        color: '#f87171', bg: '#450a0a' },
  Ended:     { label: 'Ended',            color: '#94a3b8', bg: '#0f172a' },
}

export const EventStatusBadge = ({ status }: { status: EventStatus }) => {
  const config = STATUS_CONFIG[status]
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 12px',
      borderRadius: 999,
      backgroundColor: config.bg,
      border: `1px solid ${config.color}33`,
    }}>
      <div style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        backgroundColor: config.color,
        boxShadow: status === 'Active' ? `0 0 6px ${config.color}` : 'none',
        animation: status === 'Active' ? 'pulse 2s infinite' : 'none',
      }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: config.color }}>
        {config.label}
      </span>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}