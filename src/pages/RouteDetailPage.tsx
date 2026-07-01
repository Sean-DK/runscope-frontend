import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { RouteDetail } from '../features/routes/components/RouteDetail'
import { ShareModal } from '../features/routes/components/ShareModal'
import { ConfirmModal } from '../shared/components/ConfirmModal'
import { routesApi } from '../features/routes/api'
import { Route } from '../features/routes/types'
import { ApiError } from '../shared/utils/fetchClient'
import { C, F } from '../shared/ds'

export const RouteDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [route, setRoute]               = useState<Route | null>(null)
  const [isLoading, setIsLoading]       = useState(true)
  const [isDeleting, setIsDeleting]     = useState(false)
  const [isShareOpen, setIsShareOpen]   = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showForceDelete, setShowForceDelete] = useState(false)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    routesApi.getById(id)
      .then(setRoute)
      .catch(() => setError('Route not found.'))
      .finally(() => setIsLoading(false))
  }, [id])

  const handleDelete = async () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirmed = async () => {
    if (!id) return
    setShowDeleteConfirm(false)
    setIsDeleting(true)
    try {
      await routesApi.delete(id)
      navigate('/routes')
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setShowForceDelete(true)
      } else {
        setError('Failed to delete route. Please try again.')
      }
      setIsDeleting(false)
    }
  }

  const handleForceDelete = async () => {
    if (!id) return
    setIsDeleting(true)
    setShowForceDelete(false)
    try {
      await routesApi.deleteWithEvents(id)
      navigate('/routes')
    } catch {
      setError('Failed to delete route. Please try again.')
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
    <div style={{ flex: 1, overflow: 'auto' }}>
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

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete route?"
          message="This will permanently delete the route. This action cannot be undone."
          confirmLabel="Delete route"
          destructive
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {/* Force delete confirmation modal */}
      {showForceDelete && (
        <div style={{
          position:        'fixed',
          inset:           0,
          zIndex:          100,
          background:      'rgba(0,0,0,0.6)',
          display:         'flex',
          alignItems:      'flex-end',
          justifyContent:  'center',
        }} onClick={() => setShowForceDelete(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width:         '100%',
              maxWidth:      480,
              background:    C.base,
              borderRadius:  '20px 20px 0 0',
              border:        `1px solid ${C.hairline}`,
              borderBottom:  'none',
              padding:       '28px 24px 36px',
              display:       'flex',
              flexDirection: 'column',
              gap:           16,
            }}
          >
            {/* Warning icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width:          40,
                height:         40,
                borderRadius:   12,
                background:     'rgba(255,82,71,.12)',
                border:         '1px solid rgba(255,82,71,.2)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                flexShrink:     0,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: 0 }}>
                  This route has past events
                </p>
                <p style={{ fontFamily: F.ui, fontSize: 13, color: C.textSecondary, margin: '2px 0 0' }}>
                  Deleting it will also delete all event history for this route.
                </p>
              </div>
            </div>

            <div style={{
              padding:      '12px 14px',
              background:   'rgba(255,82,71,.06)',
              borderRadius: 12,
              border:       '1px solid rgba(255,82,71,.15)',
            }}>
              <p style={{ fontFamily: F.ui, fontSize: 13, color: C.red, margin: 0, lineHeight: 1.5 }}>
                This action cannot be undone. All past races run on <strong>{route?.name}</strong> will be permanently deleted.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={handleForceDelete}
                disabled={isDeleting}
                style={{
                  padding:      '15px',
                  borderRadius: 14,
                  border:       'none',
                  background:   C.red,
                  color:        '#fff',
                  fontFamily:   F.ui,
                  fontSize:     15,
                  fontWeight:   700,
                  cursor:       isDeleting ? 'not-allowed' : 'pointer',
                }}
              >
                Delete route and all events
              </button>
              <button
                onClick={() => setShowForceDelete(false)}
                style={{
                  padding:      '12px',
                  borderRadius: 14,
                  border:       'none',
                  background:   'none',
                  color:        C.textTertiary,
                  fontFamily:   F.ui,
                  fontSize:     13,
                  fontWeight:   600,
                  cursor:       'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const centerStyle: React.CSSProperties = {
  flex:           1,
  display:        'flex',
  flexDirection:  'column',
  alignItems:     'center',
  justifyContent: 'center',
  color:          '#e2e8f0',
}

const backButtonStyle: React.CSSProperties = {
  padding:         '10px 20px',
  borderRadius:    6,
  border:          '1px solid #334155',
  backgroundColor: 'transparent',
  color:           '#94a3b8',
  fontWeight:      600,
  fontSize:        14,
  cursor:          'pointer',
}