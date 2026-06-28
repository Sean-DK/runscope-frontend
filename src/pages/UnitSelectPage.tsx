import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { C, screenPad } from '../shared/ds'

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
      backgroundColor: C.base,
      display: 'flex',
      flexDirection: 'column',
      padding: `0 ${screenPad}px`,
      alignItems: 'center',
      justifyContent: 'center',
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
          <p style={{ margin: 0, fontSize: 14, color: C.textTertiary }}>
            Which units would you like to use?
          </p>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => handleSelect('miles')}
            style={optionButtonStyle}
          >
            <span style={{ fontSize: 28 }}>🇺🇸</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary }}>Miles</div>
              <div style={{ fontSize: 13, color: C.textTertiary }}>
                min/mi, miles remaining
              </div>
            </div>
          </button>

          <button
            onClick={() => handleSelect('kilometers')}
            style={optionButtonStyle}
          >
            <span style={{ fontSize: 28 }}><GlobeIcon /></span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary }}>Kilometers</div>
              <div style={{ fontSize: 13, color: C.textTertiary }}>
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
  display:      'flex',
  alignItems:   'center',
  gap:          16,
  padding:      16,
  borderRadius: 16,
  border:       `1px solid ${C.hairline}`,
  background:   C.surface,
  color:        C.textPrimary,
  cursor:       'pointer',
  textAlign:    'left',
  width:        '100%',
}

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21.54 15H17a2 2 0 0 0-2 2v4.54"/>
    <path d="M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17"/>
    <path d="M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05"/>
    <circle cx="12" cy="12" r="10"/>
  </svg>
)