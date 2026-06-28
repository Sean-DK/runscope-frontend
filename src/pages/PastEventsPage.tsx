import { PastEventList } from '../features/events/components/PastEventList'
import { C, F, screenPad } from '../shared/ds'

export const PastEventsPage = () => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: C.base, overflow: 'auto' }}>
    {/* Page header */}
    <div style={{ padding: `20px ${screenPad}px 16px`, flexShrink: 0 }}>
      <h1 style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, letterSpacing: '-.02em', color: C.textPrimary, margin: 0 }}>
        Events
      </h1>
    </div>
    <div style={{ flex: 1 }}>
      <PastEventList />
    </div>
  </div>
)
