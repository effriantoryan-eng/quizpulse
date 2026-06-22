import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useHint } from '../../hooks/useHint'
import HintBanner from '../../components/HintBanner'
import API_BASE from '../../api'
import { T, label, btnPrimary, btnSecondary, tag } from '../../theme'

const PAGE = { maxWidth: 560, margin: 0, padding: 'clamp(28px,5vw,42px) clamp(20px,5vw,52px) 80px', fontFamily: T.font }

const PRESET_CLASSES = [
  { id: 'yr9-sci',  name: 'Year 9 Science',  students: 28, topic: 'Science'     },
  { id: 'yr10-mth', name: 'Year 10 Maths',   students: 25, topic: 'Mathematics' },
  { id: 'yr7-eng',  name: 'Year 7 English',  students: 22, topic: 'English'     },
]

const TOPIC_COLORS = {
  Science:     { bg: '#E1F5EE', color: '#085041' },
  Mathematics: { bg: '#E6F1FB', color: '#0C447C' },
  English:     { bg: '#FEF3E2', color: '#7A4100' },
}

function SendQuiz() {
  const { teacherId } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [hintVisible, dismissHint, showHint] = useHint('send')
  const { quizName = '', questionIds = [], questions = [] } = location.state || {}

  const [selectedClasses, setSelectedClasses] = useState([PRESET_CLASSES[0].id])
  const [sending, setSending] = useState(false)
  const [simulatingMsg, setSimulatingMsg] = useState('')
  const [sentResult, setSentResult] = useState(null) // { quizId, generated }
  const [error, setError] = useState(null)

  if (!quizName || questionIds.length === 0) {
    return (
      <div style={PAGE}>
        <h1 style={{ marginBottom: '16px' }}>Send quiz</h1>
        <p style={{ fontSize: '15px', color: T.muted, marginBottom: '20px' }}>
          No quiz to send. Please build a quiz first.
        </p>
        <button onClick={() => navigate('/teacher/build')} style={btnPrimary()}>Go to Build quiz</button>
      </div>
    )
  }

  function toggleClass(id) {
    setSelectedClasses(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const totalStudents = PRESET_CLASSES
    .filter(c => selectedClasses.includes(c.id))
    .reduce((sum, c) => sum + c.students, 0)

  async function handleSend() {
    setError(null)
    setSending(true)
    try {
      setSimulatingMsg('Saving quiz…')
      const quizRes = await fetch(`${API_BASE}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId,
          name: quizName,
          questionIds,
          classIds: selectedClasses,
          classSize: totalStudents,
          status: 'sent',
          sentAt: new Date().toISOString(),
        }),
      })
      if (!quizRes.ok) throw new Error(`Quiz save failed (${quizRes.status})`)
      const quiz = await quizRes.json()

      setSimulatingMsg(`Simulating ${totalStudents} student responses…`)
      const simRes = await fetch(`${API_BASE}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quiz.id,
          questions: questions.map(q => ({ id: q.id, optionCount: q.options?.length ?? 4 })),
          classSize: totalStudents,
        }),
      })
      if (!simRes.ok) throw new Error(`Simulation failed (${simRes.status})`)
      const sim = await simRes.json()

      setSentResult({ quizId: quiz.id, generated: sim.generated })
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
      setSimulatingMsg('')
    }
  }

  return (
    <div style={PAGE}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1 style={{ margin: 0 }}>Send quiz</h1>
        {!hintVisible && (
          <button onClick={showHint} style={{ background: T.surface, border: `${T.bw} solid ${T.border}`, borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', color: T.text, fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>?</button>
        )}
      </div>
      {hintVisible && (
        <HintBanner
          text="Pick which class(es) to send to — student responses will be simulated automatically. Click Send to post the quiz and jump straight to analytics."
          onDismiss={dismissHint}
        />
      )}

      {/* Quiz summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', background: T.surface, borderRadius: T.radius, marginBottom: '28px', border: `${T.bw} solid ${T.border}`, boxShadow: T.shadow }}>
        <div style={{ width: '40px', height: '40px', borderRadius: T.radiusSm, background: T.primarySoft, border: `2px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px' }}>📋</div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700 }}>{quizName}</div>
          <div style={{ fontSize: '13px', color: T.muted }}>{questionIds.length} question{questionIds.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {sentResult ? (
        /* Success state */
        <div style={{ background: T.primarySoft, border: `${T.bw} solid ${T.border}`, borderRadius: T.radius, boxShadow: T.shadow, padding: '24px' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🎉</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: T.text, marginBottom: '8px' }}>Quiz sent!</div>
          <div style={{ fontSize: '14px', color: T.text, marginBottom: '6px' }}>
            <strong>{sentResult.generated}</strong> simulated responses received.
          </div>
          <div style={{ fontSize: '13px', color: T.muted, marginBottom: '20px' }}>
            Responses were automatically generated to simulate a real class submission.
          </div>
          <button onClick={() => navigate(`/teacher/analytics/${sentResult.quizId}`)} style={{ ...btnPrimary(), width: '100%' }}>
            View analytics →
          </button>
          <button onClick={() => navigate('/teacher/quizzes')} style={{ ...btnSecondary(), width: '100%', marginTop: '10px' }}>
            All quizzes
          </button>
        </div>
      ) : (
        <>
          {/* Class selector */}
          <label style={label}>Send to class</label>

          {PRESET_CLASSES.map(c => {
            const isSelected = selectedClasses.includes(c.id)
            const topicStyle = TOPIC_COLORS[c.topic] || { bg: T.primarySoft, color: T.text }
            return (
              <div
                key={c.id}
                onClick={() => toggleClass(c.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', marginBottom: '10px',
                  border: `${T.bw} solid ${isSelected ? T.primary : T.border}`,
                  borderRadius: T.radius, background: isSelected ? T.primarySoft : T.surface,
                  boxShadow: isSelected ? 'none' : T.shadowField, cursor: 'pointer',
                }}
              >
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  border: `2px solid ${isSelected ? T.primary : T.border}`,
                  background: isSelected ? T.primary : T.surface,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: '12px', color: 'white', fontWeight: 700,
                }}>
                  {isSelected ? '✓' : ''}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: '13px', color: T.muted }}>{c.students} students</div>
                </div>
                <span style={tag(topicStyle.bg, topicStyle.color)}>{c.topic}</span>
              </div>
            )
          })}

          {/* Timing — send now only; schedule is post-MVP */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '24px 0' }}>
            <div style={{ padding: '14px', textAlign: 'center', borderRadius: T.radius, border: `${T.bw} solid ${T.primary}`, background: T.primarySoft }}>
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>📤</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: T.text }}>Send now</div>
            </div>
            <div style={{ padding: '14px', textAlign: 'center', borderRadius: T.radius, border: `${T.bw} solid ${T.border}`, background: T.surface, opacity: 0.5 }}>
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>🕐</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: T.muted }}>Schedule</div>
              <div style={{ fontSize: '11px', color: T.muted }}>Coming soon</div>
            </div>
          </div>

          {sending && simulatingMsg && (
            <div style={{ padding: '14px 18px', background: T.primarySoft, border: `${T.bw} solid ${T.border}`, borderRadius: T.radius, fontSize: '14px', color: T.text, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
              {simulatingMsg}
            </div>
          )}

          {error && (
            <div style={{ padding: '14px 18px', background: T.redSoft, border: `${T.bw} solid ${T.border}`, borderRadius: T.radius, fontSize: '14px', color: T.red, marginBottom: '16px', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <button
            disabled={selectedClasses.length === 0 || sending}
            style={{ ...btnPrimary(selectedClasses.length === 0 || sending), width: '100%' }}
            onClick={handleSend}
          >
            {sending ? 'Working…' : `Send to ${totalStudents} students →`}
          </button>

          <p style={{ fontSize: '13px', color: T.muted, textAlign: 'center', marginTop: '12px' }}>
            Responses will be simulated automatically so you can view analytics right away.
          </p>
        </>
      )}
    </div>
  )
}

export default SendQuiz
