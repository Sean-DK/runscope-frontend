import type React from 'react'

// Design tokens — RunScope design system

export const C = {
  base:          '#0A0B0D',
  surface:       '#14161A',
  elevated:      '#1C1F25',
  mapBase:       '#0C0E12',
  volt:          '#C8F94E',
  amber:         '#FFB627',
  red:           '#FF5247',
  green:         '#52FF47',
  textPrimary:   '#F2F4F7',
  textSecondary: '#98A0AC',
  textTertiary:  '#5C636E',
  hairline:      'rgba(255,255,255,0.08)',
  voltSoft:      'rgba(200,249,78,0.13)',
} as const

export const F = {
  display: "'Space Grotesk', sans-serif",
  ui:      "'Manrope', sans-serif",
  mono:    "'Space Mono', monospace",
} as const

export const card: React.CSSProperties = {
  background:   C.surface,
  border:       `1px solid ${C.hairline}`,
  borderRadius: 18,
}

export const screenPad = 22

export const btnVolt: React.CSSProperties = {
  display:         'flex',
  alignItems:      'center',
  justifyContent:  'center',
  gap:             8,
  width:           '100%',
  padding:         '15px 20px',
  borderRadius:    16,
  border:          'none',
  background:      C.volt,
  color:           C.base,
  fontFamily:      F.ui,
  fontSize:        15,
  fontWeight:      700,
  cursor:          'pointer',
}

export const btnSecondary: React.CSSProperties = {
  display:         'flex',
  alignItems:      'center',
  justifyContent:  'center',
  gap:             8,
  width:           '100%',
  padding:         '14px 20px',
  borderRadius:    16,
  border:          `1px solid ${C.hairline}`,
  background:      C.elevated,
  color:           C.textPrimary,
  fontFamily:      F.ui,
  fontSize:        15,
  fontWeight:      600,
  cursor:          'pointer',
}

export const sectionLabel: React.CSSProperties = {
  fontFamily:      F.ui,
  fontSize:        11,
  fontWeight:      700,
  letterSpacing:   '.13em',
  textTransform:   'uppercase',
  color:           C.textTertiary,
}
