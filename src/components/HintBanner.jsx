import { T } from '../theme'

export default function HintBanner({ text, onDismiss }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '14px',
      background: T.primarySoft, border: `${T.bw} solid ${T.border}`,
      borderRadius: T.radius, boxShadow: T.shadow,
      padding: '18px 20px', marginBottom: '30px',
      fontSize: '15.5px', color: T.text, lineHeight: 1.5, fontFamily: T.font,
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.primary}
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
           style={{ flexShrink: 0, marginTop: '1px' }} aria-hidden="true">
        <path d="M9 18h6" /><path d="M10 22h4" />
        <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z" />
      </svg>
      <span style={{ flex: 1 }}>{text}</span>
      <button onClick={onDismiss} style={{
        background: 'none', border: 'none', cursor: 'pointer', color: T.muted,
        fontSize: '20px', lineHeight: 1, flexShrink: 0, padding: '0 2px',
      }} aria-label="Dismiss">×</button>
    </div>
  )
}
