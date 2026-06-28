import { useState } from 'react'
import { CancelReason, CANCEL_REASONS } from '../types'

interface CancelEventModalProps {
  onConfirm: (reason: CancelReason) => void
  onDismiss: () => void
  isLoading: boolean
}

export const CancelEventModal = ({
  onConfirm,
  onDismiss,
  isLoading,
}: CancelEventModalProps) => {
  const [selectedReason, setSelectedReason] = useState<CancelReason | null>(null)

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onDismiss}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
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
        border: '1px solid #991b1b',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #1e293b' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fca5a5' }}>
            Cancel Event?
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            Select a reason to let your spectators know.
          </p>
        </div>

        {/* Reasons */}
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {CANCEL_REASONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSelectedReason(value)}
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                border: `1px solid ${selectedReason === value ? '#ef4444' : '#1e293b'}`,
                backgroundColor: selectedReason === value ? '#450a0a' : '#0f172a',
                color: selectedReason === value ? '#fca5a5' : '#94a3b8',
                fontWeight: selectedReason === value ? 600 : 400,
                fontSize: 14,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: 8,
          padding: '0 16px 16px',
        }}>
          <button
            onClick={onDismiss}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 6,
              border: '1px solid #334155',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Keep Going
          </button>
          <button
            onClick={() => selectedReason && onConfirm(selectedReason)}
            disabled={!selectedReason || isLoading}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 6,
              border: 'none',
              backgroundColor: !selectedReason || isLoading ? '#450a0a' : '#ef4444',
              color: !selectedReason || isLoading ? '#64748b' : 'white',
              fontWeight: 600,
              fontSize: 14,
              cursor: !selectedReason || isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            {isLoading ? 'Cancelling...' : 'Cancel Event'}
          </button>
        </div>
      </div>
    </>
  )
}