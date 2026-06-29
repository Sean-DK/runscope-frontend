import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { App as CapApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useAuth } from './features/auth/hooks/useAuth'
import { useActiveEventRedirect } from './features/events/hooks/useActiveEventRedirect'
import { AppLayout } from './shared/components/AppLayout'
import { HomePage } from './pages/HomePage'
import { SignInPage } from './pages/SignInPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { RouteBuilderPage } from './pages/RouteBuilderPage'
import { RoutesPage } from './pages/RoutesPage'
import { RouteDetailPage } from './pages/RouteDetailPage'
import { SharedRoutePage } from './pages/SharedRoutePage'
import { EventSetupPage } from './pages/EventSetupPage'
import { EventHostPage } from './pages/EventHostPage'
import { JoinEventPage } from './pages/JoinEventPage'
import { UnitSelectPage } from './pages/UnitSelectPage'
import { SpectatorPage } from './pages/SpectatorPage'
import { PastEventsPage } from './pages/PastEventsPage'
import { PastEventDetailPage } from './pages/PastEventDetailPage'
import { YouPage } from './pages/YouPage'
import { Browser } from '@capacitor/browser'

const AppRoutes = () => {
  const navigate = useNavigate()
  const { checkSession } = useAuth()
  const { check: checkActiveEvent } = useActiveEventRedirect()

  useEffect(() => {
    checkSession().then(() => {
      checkActiveEvent()
    })
  }, [])

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
  
    CapApp.addListener('appUrlOpen', async (event) => {
      const url = new URL(event.url)
      const path = url.pathname + url.search
      console.log('Deep link received:', path)
  
      // Close the in-app browser if it's open
      try {
        await Browser.close()
      } catch {
        // Browser may already be closed
      }
  
      navigate(path)
    })
  
    return () => {
      CapApp.removeAllListeners()
    }
  }, [navigate])

  return (
    <Routes>
      {/* Public routes — no header, no auth */}
      <Route path="/" element={<HomePage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/join" element={<JoinEventPage />} />
      <Route path="/events/:id/units" element={<UnitSelectPage />} />
      <Route path="/events/:id/watch" element={<SpectatorPage />} />
      <Route path="/routes/shared/:id" element={<SharedRoutePage />} />

      {/* Authenticated routes — AppLayout provides AuthGuard + AppHeader */}
      <Route path="/you" element={<AppLayout><YouPage /></AppLayout>} />
      <Route path="/routes" element={<AppLayout><RoutesPage /></AppLayout>} />
      <Route path="/routes/:id" element={<AppLayout><RouteDetailPage /></AppLayout>} />
      <Route path="/events/new" element={<AppLayout><EventSetupPage /></AppLayout>} />
      <Route path="/events/past" element={<AppLayout><PastEventsPage /></AppLayout>} />
      <Route path="/events/past/:id" element={<AppLayout><PastEventDetailPage /></AppLayout>} />

      {/* Authenticated but full-screen — no tab bar */}
      <Route path="/route-builder" element={<AppLayout hideTabBar><RouteBuilderPage /></AppLayout>} />
      <Route path="/events/:id/host" element={<AppLayout hideTabBar><EventHostPage /></AppLayout>} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}