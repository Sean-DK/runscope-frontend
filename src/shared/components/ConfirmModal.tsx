import { C, F, screenPad } from '../ds'

interface Props {
  title:         string
  message:       string
  confirmLabel?: string
  cancelLabel?:  string
  destructive?:  boolean
  onConfirm:     () => void
  onCancel:      () => void
}

export const ConfirmModal = ({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  destructive  = false,
  onConfirm,
  onCancel,
}: Props) => (
  <div
    style={{
      position:       'fixed',
      inset:          0,
      zIndex:         200,
      background:     'rgba(0,0,0,0.6)',
      display:        'flex',
      alignItems:     'flex-end',
      justifyContent: 'center',
    }}
    onClick={onCancel}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width:         '100%',
        maxWidth:      480,
        background:    C.base,
        borderRadius:  '20px 20px 0 0',
        border:        `1px solid ${C.hairline}`,
        borderBottom:  'none',
        padding:       `28px ${screenPad}px 36px`,
        display:       'flex',
        flexDirection: 'column',
        gap:           16,
      }}
    >
      {/* Icon + heading */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width:          40,
          height:         40,
          borderRadius:   12,
          background:     destructive ? 'rgba(255,82,71,.12)' : C.elevated,
          border:         `1px solid ${destructive ? 'rgba(255,82,71,.2)' : C.hairline}`,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
        }}>
          {destructive ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>
        <div>
          <p style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 700, color: C.textPrimary, margin: 0 }}>
            {title}
          </p>
          <p style={{ fontFamily: F.ui, fontSize: 13, color: C.textSecondary, margin: '2px 0 0', lineHeight: 1.5 }}>
            {message}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={onConfirm}
          style={{
            padding:      '15px',
            borderRadius: 14,
            border:       'none',
            background:   destructive ? C.red : C.volt,
            color:        destructive ? '#fff' : C.base,
            fontFamily:   F.ui,
            fontSize:     15,
            fontWeight:   700,
            cursor:       'pointer',
          }}
        >
          {confirmLabel}
        </button>
        <button
          onClick={onCancel}
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
          {cancelLabel}
        </button>
      </div>
    </div>
  </div>
)