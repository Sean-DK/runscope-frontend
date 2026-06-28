import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { RouteDetail } from '../features/routes/components/RouteDetail'
import { ShareModal } from '../features/routes/components/ShareModal'
import { routesApi } from '../features/routes/api'
import { Route } from '../features/routes/types'
import { ApiError } from '../shared/utils/fetchClient'

export const RouteDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [route, setRoute] = useState<Route | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    routesApi.getById(id)
      .then(setRoute)
      .catch(() => setError('Route not found.'))
      .finally(() => setIsLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this route?')) return
    setIsDeleting(true)
    try {
      await routesApi.delete(id)
      navigate('/routes')
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(err.message)
      } else {
        setError('Failed to delete route. Please try again.')
      }
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div style={centerStyle}>
        <p style={{ color: '#94a3b8' }}>Loading route...</p>
      </div>
    )
  }

  if (error || !route) {
    return (
      <div style={centerStyle}>
        <p style={{ color: '#fca5a5', marginBottom: 16 }}>{error ?? 'Route not found.'}</p>
        <button onClick={() => navigate('/routes')} style={backButtonStyle}>
          Back to Routes
        </button>
      </div>
    )
  }

  return (
    <div style={{ height: '100dvh', backgroundColor: '#0f172a', overflow: 'auto' }}>
      <RouteDetail
        route={route}
        onDelete={handleDelete}
        onShare={() => setIsShareOpen(true)}
        isDeleting={isDeleting}
      />
      {isShareOpen && (
        <ShareModal
          route={route}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </div>
  )
}

const centerStyle: React.CSSProperties = {
  height: '100dvh',
  backgroundColor: '#0f172a',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#e2e8f0',
}

const backButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: 6,
  border: '1px solid #334155',
  backgroundColor: 'transparent',
  color: '#94a3b8',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
}