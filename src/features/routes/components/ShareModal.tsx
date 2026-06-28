import { useEffect, useRef, useState } from 'react'
import { Route } from '../types'
import { downloadGpx } from '../utils/gpxExport'

interface ShareModalProps {
  route: Route
  onClose: () => void
}

export const ShareModal = ({ route, onClose }: ShareModalProps) => {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Clear copied timeout on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/routes/shared/${route.id}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      timerRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers that block clipboard access
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      timerRef.current = setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownloadGpx = () => {
    downloadGpx(route)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 100,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 101,
        width: 'min(320px, calc(100vw - 32px))',
        backgroundColor: '#1e1e2e',
        borderRadius: 12,
        border: '1px solid #1e293b',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 16px 12px',
          borderBottom: '1px solid #1e293b',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>
              Share Route
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
              {route.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: 20,
              cursor: 'pointer',
              lineHeight: 1,
              padding: '0 2px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Options */}
        <div style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ShareOption
            icon="🔗"
            label={copied ? 'Copied!' : 'Copy Link'}
            description="Anyone with the link can preview this route"
            onClick={handleCopyLink}
            highlighted={copied}
          />
          <ShareOption
            icon="📥"
            label="Download GPX"
            description="Import into Garmin, Strava, or other apps"
            onClick={handleDownloadGpx}
          />
        </div>
      </div>
    </>
  )
}

const ShareOption = ({
  icon,
  label,
  description,
  onClick,
  highlighted = false,
}: {
  icon: string
  label: string
  description: string
  onClick: () => void
  highlighted?: boolean
}) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px',
      borderRadius: 8,
      border: `1px solid ${highlighted ? '#3b82f6' : '#1e293b'}`,
      backgroundColor: highlighted ? '#1e3a5f' : '#0f172a',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'border-color 0.15s ease, background-color 0.15s ease',
      width: '100%',
    }}
  >
    <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: highlighted ? '#93c5fd' : '#e2e8f0' }}>
        {label}
      </span>
      <span style={{ fontSize: 12, color: '#64748b' }}>
        {description}
      </span>
    </div>
  </button>
)