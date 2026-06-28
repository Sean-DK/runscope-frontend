import { useNavigate } from 'react-router-dom'
import { RouteList } from '../features/routes/components/RouteList'

export const RoutesPage = () => {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: '#0f172a',
      color: '#e2e8f0',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>My Routes</h1>
        <button
          onClick={() => navigate('/route-builder')}
          style={{
            padding: '8px 14px',
            borderRadius: 6,
            border: 'none',
            backgroundColor: '#3b82f6',
            color: 'white',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          + New Route
        </button>
      </div>

      {/* List */}
      <div style={{ flex: 1 }}>
        <RouteList />
      </div>
    </div>
  )
}