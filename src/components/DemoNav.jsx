// Add this component to src/App.jsx (or a separate src/components/DemoNav.jsx)
// Then render <DemoNav /> inside your router, above the Routes/Switch

import { useNavigate, useLocation } from 'react-router-dom'

const PAGES = [
  { label: '✏️ Create Question', path: '/teacher/create' },
  { label: '🗂 Question Bank',   path: '/teacher/bank'   },
  { label: '🔧 Build Quiz',      path: '/teacher/build'  },
  { label: '📤 Send Quiz',       path: '/teacher/send'   },
  { label: '📱 Student View',    path: '/student/quiz/demo-quiz-001' },
  { label: '✅ Completion',      path: '/student/done'   },
]

export default function DemoNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '10px 20px',
      background: '#1a1433',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      flexWrap: 'wrap',
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginRight: '12px',
      }}>
        <div style={{
          width: '26px', height: '26px', borderRadius: '6px',
          background: '#534AB7', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px',
        }}>⚡</div>
        <span style={{ color: 'white', fontWeight: '600', fontSize: '14px', letterSpacing: '-0.3px' }}>
          QuizPulse
        </span>
        <span style={{
          fontSize: '10px', padding: '2px 7px', borderRadius: '20px',
          background: 'rgba(83,74,183,0.4)', color: '#AFA9EC',
          fontWeight: '500', letterSpacing: '0.5px', textTransform: 'uppercase',
        }}>demo</span>
      </div>

      {/* Nav buttons */}
      {PAGES.map(({ label, path }) => {
        const active = pathname === path || pathname.startsWith(path.split('/').slice(0, 3).join('/'))
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              border: active ? '1px solid rgba(83,74,183,0.8)' : '1px solid rgba(255,255,255,0.1)',
              background: active ? 'rgba(83,74,183,0.35)' : 'transparent',
              color: active ? 'white' : 'rgba(255,255,255,0.55)',
              fontSize: '12px',
              fontWeight: active ? '500' : '400',
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (!active) e.target.style.color = 'rgba(255,255,255,0.85)' }}
            onMouseLeave={e => { if (!active) e.target.style.color = 'rgba(255,255,255,0.55)' }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
