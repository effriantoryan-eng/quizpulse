import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useHint } from '../../hooks/useHint'
import HintBanner from '../../components/HintBanner'
import API_BASE from '../../api'
import { T, btnPrimary } from '../../theme'

const PAGE = { maxWidth: 720, margin: 0, padding: 'clamp(28px,5vw,42px) clamp(20px,5vw,52px) 80px', fontFamily: T.font }

const CLASS_NAMES = {
  'yr9-sci':  'Year 9 Science',
  'yr10-mth': 'Year 10 Maths',
  'yr7-eng':  'Year 7 English',
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function QuizHistory() {
  const { teacherId } = useAuth()
  const navigate = useNavigate()
  const [hintVisible, dismissHint, showHint] = useHint('history')
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!teacherId) return
    async function fetchQuizzes() {
      try {
        const res = await fetch(`${API_BASE}/quizzes?teacherId=${teacherId}`)
        if (!res.ok) throw new Error(`Server error ${res.status}`)
        const data = await res.json()
        setQuizzes(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchQuizzes()
  }, [teacherId])

  if (loading) return <div style={{ ...PAGE, color: T.muted }}>Loading quizzes…</div>
  if (error) return <div style={{ ...PAGE, color: T.red }}>{error}</div>

  return (
    <div style={PAGE}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0 }}>Quiz history</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {!hintVisible && (
            <button onClick={showHint} style={{ background: T.surface, border: `${T.bw} solid ${T.border}`, borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', color: T.text, fontSize: '14px', fontWeight: 700 }}>?</button>
          )}
          <button onClick={() => navigate('/teacher/build')} style={{ ...btnPrimary(), padding: '10px 18px', fontSize: '14px' }}>+ New quiz</button>
        </div>
      </div>
      {hintVisible && (
        <HintBanner
          text="All quizzes you've sent are listed here. Click any row to view its full analytics breakdown."
          onDismiss={dismissHint}
        />
      )}

      {quizzes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: T.muted, fontSize: '15px', border: `2px dashed ${T.border}`, borderRadius: T.radius }}>
          No quizzes sent yet.{' '}
          <span onClick={() => navigate('/teacher/build')} style={{ color: T.primary, cursor: 'pointer', textDecoration: 'underline', fontWeight: 700 }}>
            Build your first quiz
          </span>
        </div>
      ) : (
        <div>
          {quizzes.map(quiz => {
            const classLabels = (quiz.classIds || [])
              .map(id => CLASS_NAMES[id] || id)
              .join(', ')

            return (
              <div
                key={quiz.id}
                onClick={() => navigate(`/teacher/analytics/${quiz.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '16px 18px', marginBottom: '12px',
                  background: T.surface, border: `${T.bw} solid ${T.border}`, borderRadius: T.radius,
                  boxShadow: T.shadowField, cursor: 'pointer',
                }}
              >
                <div style={{ width: '42px', height: '42px', borderRadius: T.radiusSm, background: T.primarySoft, border: `2px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>📋</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: T.text, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {quiz.name}
                  </div>
                  <div style={{ fontSize: '12px', color: T.muted }}>
                    {classLabels || 'No class'} · {quiz.questionIds?.length ?? 0} question{(quiz.questionIds?.length ?? 0) !== 1 ? 's' : ''} · {formatDate(quiz.sentAt || quiz.createdAt)}
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {quiz.classSize > 0 && (
                    <div style={{ fontSize: '14px', fontWeight: 700, color: T.primary }}>
                      {quiz.classSize} students
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: quiz.status === 'sent' ? T.green : T.muted, marginTop: '2px', fontWeight: 600 }}>
                    {quiz.status === 'sent' ? '● Sent' : quiz.status}
                  </div>
                </div>

                <div style={{ color: T.text, fontSize: '18px', flexShrink: 0 }}>›</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
