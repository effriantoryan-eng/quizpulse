import { useNavigate } from 'react-router-dom'
import { T, label, tag, btnPrimary } from '../../theme'
import { PRESET_CLASSES, TOPIC_COLORS } from '../../presetClasses'

const PAGE = { maxWidth: 560, margin: 0, padding: 'clamp(28px,5vw,42px) clamp(20px,5vw,52px) 80px', fontFamily: T.font }

export default function Classes() {
  const navigate = useNavigate()
  const totalStudents = PRESET_CLASSES.reduce((sum, c) => sum + c.students, 0)

  return (
    <div style={PAGE}>
      <h1 style={{ marginBottom: '16px' }}>Classes</h1>

      <div style={{ padding: '14px 18px', background: T.primarySoft, border: `${T.bw} solid ${T.border}`, borderRadius: T.radius, boxShadow: T.shadowField, fontSize: '14px', color: T.text, marginBottom: '28px', lineHeight: 1.5 }}>
        These are demo classes. There are no real students — when you send a quiz to a class,
        its answers are <strong>simulated automatically</strong> so you can explore the analytics right away.
      </div>

      <label style={label}>Preset classes ({PRESET_CLASSES.length})</label>

      {PRESET_CLASSES.map(c => {
        const topicStyle = TOPIC_COLORS[c.topic] || { bg: T.primarySoft, color: T.text }
        return (
          <div
            key={c.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 16px', marginBottom: '10px',
              border: `${T.bw} solid ${T.border}`, borderRadius: T.radius,
              background: T.surface, boxShadow: T.shadowField,
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: T.radiusSm, background: topicStyle.bg, border: `2px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🎓</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>{c.name}</div>
              <div style={{ fontSize: '13px', color: T.muted }}>{c.students} students · answers simulated</div>
            </div>
            <span style={tag(topicStyle.bg, topicStyle.color)}>{c.topic}</span>
          </div>
        )
      })}

      <div style={{ fontSize: '13px', color: T.muted, margin: '14px 0 24px' }}>
        {totalStudents} simulated students across {PRESET_CLASSES.length} classes.
      </div>

      <button onClick={() => navigate('/teacher/build')} style={{ ...btnPrimary(), width: '100%' }}>
        Build a quiz to send →
      </button>
    </div>
  )
}
