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
      height:          '100dvh',  // fixed height — never grows beyond viewport
      backgroundColor: C.base,
      overflow:        'hidden',  // prevent outer scroll
    }}>
      <div style={{
        flex:      1,
        display:   'flex',
        flexDirection: 'column',
        overflowY: 'auto',  // content scrolls here, tab bar stays put
        minHeight: 0,       // required for flex children to scroll correctly
      }}>
        {children}
      </div>
      {!hideTabBar && <TabBar />}
    </div>
  </AuthGuard>
)