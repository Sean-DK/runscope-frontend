import { C, F } from "../ds";

export const StatCard = ({ label, value, icon, onClick }: { label: string; value: number | null; icon: React.ReactNode; onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      display:       'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height:        128,
      padding:       16,
      borderRadius:  18,
      border:        `1px solid ${C.hairline}`,
      background:    C.surface,
      cursor:        'pointer',
      textAlign:     'left',
    }}
  >
    <div style={{ color: C.textSecondary }}>{icon}</div>
    <div>
      <div style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, color: C.textPrimary, letterSpacing: '-.02em', lineHeight: 1 }}>
        {value ?? '—'}
      </div>
      <div style={{ fontFamily: F.ui, fontSize: 12, color: C.textSecondary, marginTop: 3 }}>
        {label}
      </div>
    </div>
  </button>
)