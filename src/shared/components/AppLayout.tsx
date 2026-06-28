import { AuthGuard } from '../../features/auth/components/AuthGuard'
import { TabBar } from './TabBar'
import { C } from '../ds'

interface AppLayoutProps {
  children: React.ReactNode
  hideTabBar?: boolean
}

export const AppLayout = ({ children, hideTabBar = false }: AppLayoutProps) => (
  <AuthGuard>
    <div style={{
      display:         'flex',
      flexDirection:   'column',
      minHeight:       '100dvh',
      backgroundColor: C.base,
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {children}
      </div>
      {!hideTabBar && <TabBar />}
    </div>
  </AuthGuard>
)
