import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useHint } from '../../hooks/useHint'
import HintBanner from '../../components/HintBanner'
import API_BASE from '../../api'
import { T, label, input, btnPrimary, tag } from '../../theme'

const PAGE = { maxWidth: 900, margin: 0, padding: 'clamp(28px,5vw,42px) clamp(20px,5vw,52px) 80px', fontFamily: T.font }

const TOPIC_COLORS = {
  Science:     { bg: '#E1F5EE', color: '#085041' },
  History:     { bg: '#FAEEDA', color: '#633806' },
  Mathematics: { bg: '#E6F1FB', color: '#0C447C' },
  English:     { bg: '#FBEAF0', color: '#4B1528' },
  Geography:   { bg: T.primarySoft, color: T.text },
}

function BuildQuiz() {
  const { teacherId } = useAuth()
  const navigate = useNavigate()
  const [hintVisible, dismissHint, showHint] = useHint('build')
  const [quizName, setQuizName] = useState('')
  const [allQuestions, setAllQuestions] = useState([])
  const [selected, setSelected] = useState([])
  const [previewIndex, setPreviewIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!teacherId) return
    async function fetchQuestions() {
      try {
        const res = await fetch(`${API_BASE}/questions?teacherId=${teacherId}`)
        if (!res.ok) throw new Error(`Server error ${res.status}`)
        const data = await res.json()
        setAllQuestions(data)
        setSelected(data)
        setPreviewIndex(0)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [teacherId])

  function moveUp(index) {
    if (index === 0) return
    const updated = [...selected]
    ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    setSelected(updated)
    if (previewIndex === index) setPreviewIndex(index - 1)
  }

  function moveDown(index) {
    if (index === selected.length - 1) return
    const updated = [...selected]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    setSelected(updated)
    if (previewIndex === index) setPreviewIndex(index + 1)
  }

  function removeQuestion(id) {
    setSelected(prev => prev.filter(q => q.id !== id))
    setPreviewIndex(0)
  }

  const previewQuestion = selected[previewIndex]

  if (loading) return <div style={{ ...PAGE, color: T.muted }}>Loading questions…</div>
  if (error) return <div style={{ ...PAGE, color: T.red }}>Failed to load questions: {error}</div>

  const iconBtn = { background: T.surface, border: `2px solid ${T.border}`, borderRadius: T.radiusSm, cursor: 'pointer', fontSize: '11px', color: T.text, padding: '2px 6px', lineHeight: 1 }

  return (
    <div style={PAGE}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1 style={{ margin: 0 }}>Build quiz</h1>
        {!hintVisible && (
          <button onClick={showHint} style={{ background: T.surface, border: `${T.bw} solid ${T.border}`, borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', color: T.text, fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>?</button>
        )}
      </div>
      {hintVisible && (
        <HintBanner
          text="Select the questions to include, reorder them using the arrows, give your quiz a name, then click Proceed to Send."
          onDismiss={dismissHint}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

        {/* Left — quiz details and questions */}
        <div>
          <div style={{ marginBottom: '24px' }}>
            <label style={label}>Quiz name</label>
            <input
              type="text"
              value={quizName}
              placeholder="e.g. Week 4 — Photosynthesis check-in"
              onChange={e => setQuizName(e.target.value)}
              style={input}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={label}>Selected questions ({selected.length})</label>

            {selected.length === 0 && (
              <div style={{ fontSize: '14px', color: T.muted, padding: '16px', textAlign: 'center', border: `2px dashed ${T.border}`, borderRadius: T.radius }}>
                No questions added yet
              </div>
            )}

            {selected.map((q, i) => {
              const topicStyle = TOPIC_COLORS[q.topic] || { bg: T.primarySoft, color: T.text }
              const active = previewIndex === i
              return (
                <div
                  key={q.id}
                  onClick={() => setPreviewIndex(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px 14px', marginBottom: '10px',
                    border: `${T.bw} solid ${T.border}`, borderRadius: T.radius,
                    background: active ? T.primarySoft : T.surface,
                    boxShadow: active ? T.shadow : T.shadowField,
                    cursor: 'pointer', fontSize: '14px',
                  }}
                >
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${T.border}`, background: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ flex: 1, lineHeight: 1.4, fontWeight: 500 }}>{q.text}</span>
                  <span style={{ ...tag(topicStyle.bg, topicStyle.color), flexShrink: 0 }}>{q.topic}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <button onClick={e => { e.stopPropagation(); moveUp(i) }} style={iconBtn}>▲</button>
                    <button onClick={e => { e.stopPropagation(); moveDown(i) }} style={iconBtn}>▼</button>
                  </div>
                  <button onClick={e => { e.stopPropagation(); removeQuestion(q.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: T.muted, padding: '2px 6px' }}>×</button>
                </div>
              )
            })}

            <div
              style={{ border: `2px dashed ${T.border}`, borderRadius: T.radius, padding: '14px', textAlign: 'center', fontSize: '14px', color: T.muted, cursor: 'pointer', marginTop: '4px', fontWeight: 600 }}
              onClick={() => navigate('/teacher/bank')}
            >
              + Add more from bank
            </div>
          </div>
        </div>

        {/* Right — preview */}
        <div>
          <label style={label}>Preview — student view</label>
          <div style={{ background: T.surface2, borderRadius: T.radius, padding: '16px', border: `${T.bw} solid ${T.border}`, boxShadow: T.shadow }}>
            {previewQuestion ? (
              <>
                <div style={{ fontSize: '12px', color: T.muted, textAlign: 'center', marginBottom: '12px', fontWeight: 600 }}>
                  Question {previewIndex + 1} of {selected.length}
                </div>
                <div style={{ background: T.surface, border: `${T.bw} solid ${T.border}`, borderRadius: T.radiusSm, padding: '14px', marginBottom: '12px', fontSize: '15px', lineHeight: 1.5, fontWeight: 500 }}>
                  {previewQuestion.text}
                </div>
                {(previewQuestion.options || []).map((opt, i) => {
                  const correct = i === previewQuestion.correctIndex
                  return (
                    <div key={i} style={{ background: correct ? T.primarySoft : T.surface, border: `2px solid ${correct ? T.primary : T.border}`, borderRadius: T.radiusSm, padding: '11px 14px', marginBottom: '8px', fontSize: '14px', color: T.text, fontWeight: correct ? 600 : 500 }}>
                      {opt}
                    </div>
                  )
                })}
              </>
            ) : (
              <div style={{ fontSize: '14px', color: T.muted, textAlign: 'center', padding: '24px' }}>No questions to preview</div>
            )}
          </div>

          <button
            disabled={selected.length === 0 || !quizName.trim()}
            style={{ ...btnPrimary(selected.length === 0 || !quizName.trim()), width: '100%', marginTop: '16px' }}
            onClick={() => navigate('/teacher/send', { state: { quizName, questionIds: selected.map(q => q.id), questions: selected } })}
          >
            Save & go to send →
          </button>
        </div>
      </div>
    </div>
  )
}

export default BuildQuiz
