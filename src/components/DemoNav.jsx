import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import API_BASE from '../api'
import { useAuth } from '../contexts/AuthContext'

const STATIC_PAGES = [
  { label: '✏️ Create Question', path: '/teacher/create' },
  { label: '🗂 Question Bank',   path: '/teacher/bank'   },
  { label: '🔧 Build Quiz',      path: '/teacher/build'  },
  { label: '📤 Send Quiz',       path: '/teacher/send'   },
]

export default function DemoNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { teacherId } = useAuth()
  const [latestQuizId, setLatestQuizId] = useState(null)

  useEffect(() => {
    if (!teacherId) return
    async function fetchLatestQuiz() {
      try {
        const res = await fetch(`${API_BASE}/quizzes?teacherId=${teacherId}`)
        if (!res.ok) return
        const quizzes = await res.json()
        if (quizzes.length === 0) return
        const latest = quizzes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
        setLatestQuizId(latest.id)
      } catch {
        // silently fail — nav degrades gracefully
      }
    }
    fetchLatestQuiz()
  }, [teacherId])

  const dynamicPages = [
    ...STATIC_PAGES,
    { label: '📱 Student View', path: latestQuizId ? `/student/quiz/${latestQuizId}` : null },
    { label: '📊 Analytics',    path: latestQuizId ? `/teacher/analytics/${latestQuizId}` : null },
    { label: '✅ Completion',   path: '/student/done' },
  ]

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
      {dynamicPages.map(({ label, path }) => {
        const disabled = !path
        const active = path && (pathname === path || pathname.startsWith(path.split('/').slice(0, 3).join('/')))
        return (
          <button
            key={label}
            onClick={() => path && navigate(path)}
            disabled={disabled}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              border: active ? '1px solid rgba(83,74,183,0.8)' : '1px solid rgba(255,255,255,0.1)',
              background: active ? 'rgba(83,74,183,0.35)' : 'transparent',
              color: active ? 'white' : disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.55)',
              fontSize: '12px',
              fontWeight: active ? '500' : '400',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (!active && !disabled) e.target.style.color = 'rgba(255,255,255,0.85)' }}
            onMouseLeave={e => { if (!active && !disabled) e.target.style.color = 'rgba(255,255,255,0.55)' }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
