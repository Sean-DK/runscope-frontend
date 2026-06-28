import { PastEventList } from '../features/events/components/PastEventList'

export const PastEventsPage = () => {
  return (
    <div style={{
      flex: 1,
      color: '#e2e8f0',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ flex: 1 }}>
        <PastEventList />
      </div>
    </div>
  )
}