import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import API_BASE from '../../api'
import { T, btnPrimary, btnSecondary } from '../../theme'
import { CLASS_NAMES } from '../../presetClasses'

const PAGE = { maxWidth: 720, margin: 0, padding: 'clamp(28px,5vw,42px) clamp(20px,5vw,52px) 80px', fontFamily: T.font }

const sectionLabel = {
  fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em',
  color: T.muted, margin: '28px 0 12px', fontFamily: T.font,
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function TeacherHome() {
  const { teacherId } = useAuth()
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [questionCount, setQuestionCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!teacherId) return
    async function load() {
      try {
        const [qzRes, qnRes] = await Promise.all([
          fetch(`${API_BASE}/quizzes?teacherId=${teacherId}`),
          fetch(`${API_BASE}/questions?teacherId=${teacherId}`),
        ])
        if (!qzRes.ok) throw new Error(`Server error ${qzRes.status}`)
        if (!qnRes.ok) throw new Error(`Server error ${qnRes.status}`)
        const qz = await qzRes.json()
        const qn = await qnRes.json()
        setQuizzes(qz.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
        setQuestionCount(Array.isArray(qn) ? qn.length : 0)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [teacherId])

  if (loading) return <div style={{ ...PAGE, color: T.muted }}>Loading…</div>
  if (error) return <div style={{ ...PAGE, color: T.red }}>{error}</div>

  const sentCount = quizzes.filter(q => q.status === 'sent').length
  const recent = quizzes.slice(0, 5)

  const quickBtn = (label, onClick, primary) => (
    <button
      onClick={onClick}
      style={{ ...(primary ? btnPrimary() : btnSecondary()), flex: 1, minWidth: '160px', padding: '14px 18px' }}
    >
      {label}
    </button>
  )

  const tile = (label, val) => (
    <div key={label} style={{ background: T.surface, border: `${T.bw} solid ${T.border}`, borderRadius: T.radius, boxShadow: T.shadowField, padding: '16px 8px', textAlign: 'center' }}>
      <div style={{ fontSize: '24px', fontWeight: 800, color: T.text }}>{val}</div>
      <div style={{ fontSize: '11px', color: T.muted, marginTop: '2px', fontWeight: 600 }}>{label}</div>
    </div>
  )

  return (
    <div style={PAGE}>
      <h1 style={{ marginBottom: '4px' }}>Dashboard</h1>
      <div style={{ fontSize: '14px', color: T.muted, marginBottom: '22px' }}>
        Here's what's happening with your quizzes.
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {quickBtn('Build a quiz', () => navigate('/teacher/build'), true)}
        {quickBtn('New question', () => navigate('/teacher/create'), false)}
      </div>

      {/* Recent quizzes */}
      <div style={sectionLabel}>Recent quizzes</div>
      {recent.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: T.muted, fontSize: '15px', border: `2px dashed ${T.border}`, borderRadius: T.radius }}>
          Nothing sent yet.{' '}
          <span onClick={() => navigate('/teacher/build')} style={{ color: T.primary, cursor: 'pointer', textDecoration: 'underline', fontWeight: 700 }}>
            Build your first quiz
          </span>
        </div>
      ) : (
        recent.map(quiz => {
          const classLabels = (quiz.classIds || []).map(id => CLASS_NAMES[id] || id).join(', ')
          return (
            <div
              key={quiz.id}
              onClick={() => navigate(`/teacher/analytics/${quiz.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 18px', marginBottom: '12px', background: T.surface, border: `${T.bw} solid ${T.border}`, borderRadius: T.radius, boxShadow: T.shadowField, cursor: 'pointer' }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: T.radiusSm, background: T.primarySoft, border: `2px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>📋</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: T.text, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{quiz.name}</div>
                <div style={{ fontSize: '12px', color: T.muted }}>
                  {classLabels || 'No class'} · {quiz.questionIds?.length ?? 0} question{(quiz.questionIds?.length ?? 0) !== 1 ? 's' : ''} · {formatDate(quiz.sentAt || quiz.createdAt)}
                </div>
              </div>
              <div style={{ color: T.text, fontSize: '18px', flexShrink: 0 }}>›</div>
            </div>
          )
        })
      )}

      {/* At-a-glance counts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '24px' }}>
        {tile('Questions', questionCount)}
        {tile('Quizzes sent', sentCount)}
      </div>
    </div>
  )
}
