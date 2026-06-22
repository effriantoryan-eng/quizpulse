import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useHint } from '../../hooks/useHint'
import HintBanner from '../../components/HintBanner'
import API_BASE from '../../api'
import { T, btnSecondary, tag } from '../../theme'

const PAGE = { maxWidth: 760, margin: 0, padding: 'clamp(28px,5vw,42px) clamp(20px,5vw,52px) 80px', fontFamily: T.font }

function Analytics() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const [hintVisible, dismissHint, showHint] = useHint('analytics')
  const [classSize, setClassSize] = useState(null)
  const [questions, setQuestions] = useState([])
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const quizRes = await fetch(`${API_BASE}/quizzes/${quizId}`)
        if (quizRes.status === 404) throw new Error('Quiz not found')
        if (!quizRes.ok) throw new Error(`Server error ${quizRes.status}`)
        const quizData = await quizRes.json()

        const [responsesRes, questionsRes] = await Promise.all([
          fetch(`${API_BASE}/responses?quizId=${quizId}`),
          fetch(`${API_BASE}/questions?teacherId=${quizData.teacherId}`)
        ])

        if (!responsesRes.ok || !questionsRes.ok) throw new Error('Failed to load data')

        const responsesData = await responsesRes.json()
        const allQuestions = await questionsRes.json()
        const quizQuestions = quizData.questionIds
          .map(qid => allQuestions.find(q => q.id === qid))
          .filter(Boolean)

        setResponses(responsesData)
        setQuestions(quizQuestions)
        setClassSize(quizData.classSize || null)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }
    fetchData()
  }, [quizId])

  function getOptionCounts(questionId, optionCount) {
    const counts = Array(optionCount).fill(0)
    responses.forEach(r => {
      const answer = r.answers?.find(a => a.questionId === questionId)
      if (answer !== undefined && answer.selectedIndex >= 0) {
        counts[answer.selectedIndex]++
      }
    })
    return counts
  }

  if (loading) return <div style={{ ...PAGE, color: T.muted }}>Loading analytics...</div>
  if (error) return <div style={{ ...PAGE, color: T.red }}>{error}</div>

  const totalResponses = responses.length

  return (
    <div style={PAGE}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={() => navigate('/teacher/quizzes')} style={{ ...btnSecondary(), padding: '8px 14px', fontSize: '14px' }}>← Back</button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '32px' }}>Quiz Analytics</h1>
          <div style={{ fontSize: '13px', color: T.muted, marginTop: '4px' }}>Quiz ID: {quizId}</div>
        </div>
        {!hintVisible && (
          <button onClick={showHint} style={{ background: T.surface, border: `${T.bw} solid ${T.border}`, borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', color: T.text, fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>?</button>
        )}
      </div>
      {hintVisible && (
        <HintBanner
          text="Each question shows how the class responded. The pink bar is the correct answer. Use the question cards below to see the full breakdown."
          onDismiss={dismissHint}
        />
      )}

      {/* Summary card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '28px' }}>
        <div style={{ background: T.primary, borderRadius: T.radius, border: `${T.bw} solid ${T.border}`, boxShadow: T.shadow, padding: '20px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: '38px', fontWeight: 700 }}>
            {classSize ? `${totalResponses} / ${classSize}` : totalResponses}
          </div>
          <div style={{ fontSize: '13px', marginTop: '4px', fontWeight: 600 }}>Students responded</div>
        </div>
        <div style={{ background: T.primarySoft, borderRadius: T.radius, border: `${T.bw} solid ${T.border}`, boxShadow: T.shadow, padding: '20px', color: T.text, textAlign: 'center' }}>
          <div style={{ fontSize: '38px', fontWeight: 700 }}>{questions.length}</div>
          <div style={{ fontSize: '13px', marginTop: '4px', fontWeight: 600 }}>Questions in quiz</div>
        </div>
      </div>

      {/* Per question breakdown */}
      {questions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px', color: T.muted, fontSize: '15px', background: T.surface, border: `${T.bw} solid ${T.border}`, borderRadius: T.radius }}>
          No questions found for this quiz.
        </div>
      )}

      {questions.map((q, qi) => {
        const counts = getOptionCounts(q.id, q.options.length)
        const total = counts.reduce((a, b) => a + b, 0)

        return (
          <div key={q.id} style={{ background: T.surface, border: `${T.bw} solid ${T.border}`, borderRadius: T.radius, boxShadow: T.shadow, padding: '20px', marginBottom: '18px' }}>

            <div style={{ fontSize: '12px', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '8px', fontWeight: 700 }}>
              Question {qi + 1}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, lineHeight: 1.5, marginBottom: '20px', color: T.text }}>
              {q.text}
            </div>

            {q.options.map((opt, i) => {
              const count = counts[i]
              const percent = total > 0 ? Math.round((count / total) * 100) : 0
              const isCorrect = i === q.correctIndex
              const barColor = isCorrect ? T.primary : '#c7c0b0'

              return (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{
                      width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700,
                      background: isCorrect ? T.primarySoft : T.surface,
                      border: `2px solid ${isCorrect ? T.primary : T.border}`,
                      color: T.text,
                    }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span style={{ flex: 1, fontSize: '14px', color: T.text, fontWeight: 500 }}>{opt}</span>
                    {isCorrect && <span style={{ ...tag(T.primarySoft, T.text), flexShrink: 0 }}>Correct</span>}
                    <span style={{ fontSize: '14px', fontWeight: 700, color: T.text, minWidth: '44px', textAlign: 'right' }}>
                      {percent}%
                    </span>
                  </div>
                  <div style={{ height: '12px', background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: '99px', overflow: 'hidden', marginLeft: '34px' }}>
                    <div style={{ height: '100%', width: `${percent}%`, background: barColor, transition: 'width 0.5s ease' }} />
                  </div>
                  <div style={{ fontSize: '11px', color: T.muted, marginLeft: '34px', marginTop: '3px' }}>
                    {count} response{count !== 1 ? 's' : ''}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}

      {totalResponses === 0 && questions.length > 0 && (
        <div style={{ textAlign: 'center', padding: '24px', color: T.muted, fontSize: '15px', background: T.surface, border: `${T.bw} solid ${T.border}`, borderRadius: T.radius }}>
          No responses recorded for this quiz.
        </div>
      )}
    </div>
  )
}

export default Analytics
