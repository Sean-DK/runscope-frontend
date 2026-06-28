import { AuthGuard } from '../../features/auth/components/AuthGuard'
import { AppHeader } from './AppHeader'

interface AppLayoutProps {
  children: React.ReactNode
  hideHeader?: boolean
}

export const AppLayout = ({ children, hideHeader = false }: AppLayoutProps) => (
  <AuthGuard>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100dvh',
      backgroundColor: '#0f172a',
    }}>
      {!hideHeader && <AppHeader />}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  </AuthGuard>
)