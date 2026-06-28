import { ConnectionStatus } from '../types'

const STATUS_CONFIG: Record<ConnectionStatus, { label: string; color: string; bg: string }> = {
  Connecting:    { label: 'Connecting to racer...', color: '#fbbf24', bg: '#451a03' },
  Connected:     { label: 'Live',                   color: '#34d399', bg: '#022c22' },
  Reconnecting:  { label: 'Reconnecting...',         color: '#fbbf24', bg: '#451a03' },
  Disconnected:  { label: 'Disconnected',            color: '#f87171', bg: '#450a0a' },
}

export const ConnectionStatusBar = ({ status }: { status: ConnectionStatus }) => {
  const config = STATUS_CONFIG[status]

  // Don't show the bar when connected and live — keep the UI clean
  if (status === 'Connected') return null

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      padding: '6px 12px',
      backgroundColor: config.bg,
      borderBottom: `1px solid ${config.color}33`,
    }}>
      <div style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: config.color,
      }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: config.color }}>
        {config.label}
      </span>
    </div>
  )
}