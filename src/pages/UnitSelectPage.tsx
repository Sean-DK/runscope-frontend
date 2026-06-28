import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

export const UnitSelectPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()

  // Preserve any existing query params (e.g. coming from a direct link)
  const handleSelect = (units: 'miles' | 'kilometers') => {
    const params = new URLSearchParams(searchParams)
    params.set('units', units)
    navigate(`/events/${id}/watch?${params.toString()}`)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: '#0f172a',
      color: '#e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 360,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800 }}>
            Before you watch...
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
            Which units would you like to use?
          </p>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => handleSelect('miles')}
            style={optionButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6'
              e.currentTarget.style.backgroundColor = '#1e3a5f'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#1e293b'
              e.currentTarget.style.backgroundColor = '#1e1e2e'
            }}
          >
            <span style={{ fontSize: 28 }}>🇺🇸</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Miles</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                min/mi, miles remaining
              </div>
            </div>
          </button>

          <button
            onClick={() => handleSelect('kilometers')}
            style={optionButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6'
              e.currentTarget.style.backgroundColor = '#1e3a5f'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#1e293b'
              e.currentTarget.style.backgroundColor = '#1e1e2e'
            }}
          >
            <span style={{ fontSize: 28 }}>🌍</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Kilometers</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                min/km, kilometers remaining
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

const optionButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '16px',
  borderRadius: 12,
  border: '1px solid #1e293b',
  backgroundColor: '#1e1e2e',
  color: '#e2e8f0',
  cursor: 'pointer',
  textAlign: 'left',
  width: '100%',
  transition: 'border-color 0.15s ease, background-color 0.15s ease',
}