// ─── "Bold Pop" theme tokens ──────────────────────────────────────────────
// Neo-brutalist look: hard black borders, flat zero-blur offset shadows,
// hot-pink + yellow accents, Space Grotesk type. See design_handoff_bold_pop/.
export const T = {
  // surfaces
  bg:          '#fff8ec',
  surface:     '#ffffff',
  surface2:    '#fff0d6',
  // ink
  border:      '#111111',
  text:        '#141414',
  muted:       '#6b6b6b',
  // accents
  primary:     '#ff2e63', // hot pink — primary / correct / accent
  primaryInk:  '#ffffff',
  primarySoft: '#ffe14d', // yellow — selected fills, tip callouts
  // semantic (analytics keeps a distinct correct-green so bars stay legible)
  green:       '#2f7d12',
  greenSoft:   '#eaf6dd',
  red:         '#A32D2D',
  redSoft:     '#FCEBEB',
  // sidebar
  navBg:           '#111111',
  navText:         '#ffffff',
  navMuted:        '#9a9a9a',
  navActiveBg:     '#ffd000',
  navActiveText:   '#111111',
  navActiveShadow: '3px 3px 0 #ff2e63',
  badgeBg:   '#00d4a0',
  badgeText: '#111111',
  logoGrad:  'linear-gradient(135deg, #ff2e63, #ff8a00)',
  // geometry
  radius:     '8px',
  radiusSm:   '6px',
  chipRadius: '999px',
  bw:         '2px',
  // shadows (flat, zero blur, offset only)
  shadow:      '4px 4px 0 #111111',
  shadowField: '3px 3px 0 #111111',
  font: "'Space Grotesk', system-ui, 'Segoe UI', Roboto, sans-serif",
}

// ─── Reusable style fragments ──────────────────────────────────────────────
export const label = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.09em',
  color: T.muted,
  marginBottom: '10px',
  fontFamily: T.font,
}

export const input = {
  width: '100%',
  padding: '14px 16px',
  border: `${T.bw} solid ${T.border}`,
  borderRadius: T.radiusSm,
  background: T.surface,
  color: T.text,
  fontFamily: T.font,
  fontSize: '16px',
  fontWeight: 500,
  boxShadow: T.shadowField,
  boxSizing: 'border-box',
  outline: 'none',
}

export const card = {
  background: T.surface,
  border: `${T.bw} solid ${T.border}`,
  borderRadius: T.radius,
  boxShadow: T.shadow,
}

export function btnPrimary(disabled = false) {
  return {
    padding: '14px 26px',
    borderRadius: T.radius,
    border: `${T.bw} solid ${T.border}`,
    background: disabled ? '#d8d2c4' : T.primary,
    color: disabled ? T.muted : T.primaryInk,
    fontFamily: T.font,
    fontWeight: 700,
    fontSize: '16px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: disabled ? 'none' : T.shadow,
  }
}

export function btnSecondary() {
  return {
    padding: '14px 22px',
    borderRadius: T.radius,
    border: `${T.bw} solid ${T.border}`,
    background: 'transparent',
    color: T.text,
    fontFamily: T.font,
    fontWeight: 600,
    fontSize: '15px',
    cursor: 'pointer',
  }
}

// pill-shaped chip; `active` paints it hot-pink with an offset shadow
export function chip(active = false) {
  return {
    padding: '9px 18px',
    borderRadius: T.chipRadius,
    border: `${T.bw} solid ${active ? T.primary : T.border}`,
    background: active ? T.primary : T.surface,
    color: active ? '#ffffff' : T.text,
    fontFamily: T.font,
    fontWeight: active ? 700 : 600,
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: active ? T.shadow : 'none',
  }
}

// small status/topic tag
export function tag(bg = T.primarySoft, color = T.text) {
  return {
    fontSize: '11px',
    fontWeight: 700,
    padding: '3px 9px',
    borderRadius: T.chipRadius,
    border: `1.5px solid ${T.border}`,
    background: bg,
    color,
    fontFamily: T.font,
  }
}
