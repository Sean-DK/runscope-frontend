import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useAuth } from './features/auth/hooks/useAuth'
import { AuthGuard } from './features/auth/components/AuthGuard'
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
import { SpectatorPage } from './pages/SpectatorPage'
import { PastEventsPage } from './pages/PastEventsPage'
import { PastEventDetailPage } from './pages/PastEventDetailPage'

const AppRoutes = () => {
  const { checkSession } = useAuth()

  useEffect(() => {
    checkSession()
  }, [])

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/join" element={<JoinEventPage />} />
      <Route path="/events/:id/watch" element={<SpectatorPage />} />
      <Route path="/routes/shared/:id" element={<SharedRoutePage />} />

      {/* Protected routes */}
      <Route path="/route-builder" element={<AuthGuard><RouteBuilderPage /></AuthGuard>} />
      <Route path="/routes" element={<AuthGuard><RoutesPage /></AuthGuard>} />
      <Route path="/routes/:id" element={<AuthGuard><RouteDetailPage /></AuthGuard>} />
      <Route path="/events/past" element={<AuthGuard><PastEventsPage /></AuthGuard>} />
      <Route path="/events/past/:id" element={<AuthGuard><PastEventDetailPage /></AuthGuard>} />
      <Route path="/events/new" element={<AuthGuard><EventSetupPage /></AuthGuard>} />
      <Route path="/events/:id/host" element={<AuthGuard><EventHostPage /></AuthGuard>} />
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