import { useNavigate } from 'react-router-dom'

const STEPS = [
  { icon: '✏️', label: 'Create questions', desc: 'Build a question bank across topics and year levels.', path: '/teacher/create' },
  { icon: '🔧', label: 'Build a quiz',     desc: 'Pick questions, give the quiz a name, and arrange the order.', path: '/teacher/build' },
  { icon: '📤', label: 'Send to a class',  desc: 'Choose a class — responses are simulated instantly.', path: '/teacher/send' },
  { icon: '📊', label: 'View analytics',   desc: 'See per-question breakdowns and participation rates.', path: null },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '64px', height: '64px', borderRadius: '16px',
          background: 'linear-gradient(135deg, #534AB7 0%, #7B6EDE 100%)',
          fontSize: '28px', marginBottom: '20px',
          boxShadow: '0 8px 24px rgba(83,74,183,0.35)',
        }}>⚡</div>

        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1a1433', marginBottom: '12px', letterSpacing: '-0.5px' }}>
          QuizPulse
        </h1>
        <p style={{ fontSize: '16px', color: '#666', maxWidth: '420px', margin: '0 auto 28px', lineHeight: '1.6' }}>
          Low-stakes classroom check-ins for secondary school teachers.
          No grades. Just participation.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/teacher/create')}
            style={{
              padding: '12px 28px', borderRadius: '8px',
              background: '#534AB7', color: 'white',
              border: 'none', fontSize: '15px', fontWeight: '500',
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(83,74,183,0.35)',
            }}
          >
            Start demo →
          </button>
          <button
            onClick={() => navigate('/demo')}
            style={{
              padding: '12px 28px', borderRadius: '8px',
              background: 'white', color: '#534AB7',
              border: '1px solid #534AB7', fontSize: '15px', fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Preview mockups
          </button>
        </div>
      </div>

      {/* How it works */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#999', marginBottom: '20px', textAlign: 'center' }}>
          How the demo works
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {STEPS.map((step, i) => (
            <div
              key={step.label}
              onClick={() => step.path && navigate(step.path)}
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #eee',
                background: 'white',
                cursor: step.path ? 'pointer' : 'default',
                transition: 'box-shadow 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { if (step.path) { e.currentTarget.style.boxShadow = '0 4px 16px rgba(83,74,183,0.12)'; e.currentTarget.style.borderColor = '#c5c0f0' } }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '#eee' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '28px', height: '28px', borderRadius: '7px',
                  background: '#EEEDFE', fontSize: '14px', flexShrink: 0,
                }}>{step.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1433' }}>{i + 1}. {step.label}</span>
              </div>
              <p style={{ fontSize: '13px', color: '#777', lineHeight: '1.5', margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Callout */}
      <div style={{
        padding: '20px 24px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #f5f4ff 0%, #ede9ff 100%)',
        border: '1px solid #c5c0f0',
        display: 'flex', gap: '16px', alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: '22px', flexShrink: 0, marginTop: '2px' }}>🎓</span>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#3C3489', marginBottom: '4px' }}>
            Teacher-only demo
          </div>
          <p style={{ fontSize: '13px', color: '#5a5298', lineHeight: '1.6', margin: 0 }}>
            This demo runs entirely from the teacher's perspective. When you send a quiz,
            student responses are automatically simulated so you can jump straight to analytics.
            Student view, push notifications, and scheduling are shown as mockups in the{' '}
            <span
              onClick={() => navigate('/demo')}
              style={{ textDecoration: 'underline', cursor: 'pointer' }}
            >
              Preview gallery
            </span>.
          </p>
        </div>
      </div>
    </div>
  )
}
