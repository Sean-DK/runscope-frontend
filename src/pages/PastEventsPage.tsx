import { useNavigate } from 'react-router-dom'
import { PastEventList } from '../features/events/components/PastEventList'

export const PastEventsPage = () => {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: '#0f172a',
      color: '#e2e8f0',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        borderBottom: '1px solid #1e293b',
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: 22,
            cursor: 'pointer',
            lineHeight: 1,
            padding: 0,
          }}
        >
          ‹
        </button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Past Events</h1>
      </div>

      <div style={{ flex: 1 }}>
        <PastEventList />
      </div>
    </div>
  )
}