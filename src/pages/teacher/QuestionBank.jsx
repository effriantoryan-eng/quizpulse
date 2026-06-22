import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useHint } from '../../hooks/useHint'
import HintBanner from '../../components/HintBanner'
import API_BASE from '../../api'
import { T, label, input, chip, btnPrimary, btnSecondary, tag, card } from '../../theme'

const PAGE = { maxWidth: 760, margin: 0, padding: 'clamp(28px,5vw,42px) clamp(20px,5vw,52px) 80px', fontFamily: T.font }

const TOPIC_COLORS = {
  Science:     { bg: '#E1F5EE', color: '#085041' },
  History:     { bg: '#FAEEDA', color: '#633806' },
  Mathematics: { bg: '#E6F1FB', color: '#0C447C' },
  English:     { bg: '#FBEAF0', color: '#4B1528' },
  Geography:   { bg: T.primarySoft, color: T.text },
}

const ALLOWED_TOPICS = ['Science', 'History', 'Mathematics', 'English', 'Geography']

const BLANK_FORM = { text: '', options: ['', '', '', ''], correctIndex: 0, topic: 'Science' }

function QuestionBank() {
  const { teacherId } = useAuth()
  const [hintVisible, dismissHint, showHint] = useHint('bank')
  const [questions, setQuestions] = useState([])
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(BLANK_FORM)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState(null)

  useEffect(() => {
    if (!teacherId) return
    async function fetchQuestions() {
      try {
        const res = await fetch(`${API_BASE}/questions?teacherId=${teacherId}`)
        if (!res.ok) throw new Error('Failed to load questions')
        const data = await res.json()
        setQuestions(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [teacherId])

  const topics = ['All', ...new Set(questions.map(q => q.topic))]
  const filtered = filter === 'All' ? questions : questions.filter(q => q.topic === filter)

  function toggleSelect(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  function startEdit(q, e) {
    e.stopPropagation()
    setEditingId(q.id)
    setEditForm({ text: q.text, options: [...q.options], correctIndex: q.correctIndex, topic: q.topic })
    setEditError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditError(null)
  }

  async function saveEdit(id) {
    setEditError(null)
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, teacherId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `Server error ${res.status}`)
      }
      const updated = await res.json()
      setQuestions(prev => prev.map(q => q.id === id ? updated : q))
      setEditingId(null)
    } catch (err) {
      setEditError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteQuestion(id, e) {
    e.stopPropagation()
    if (!window.confirm('Delete this question? This cannot be undone.')) return
    try {
      const res = await fetch(`${API_BASE}/questions/${id}?teacherId=${teacherId}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) throw new Error(`Server error ${res.status}`)
      setQuestions(prev => prev.filter(q => q.id !== id))
      setSelected(prev => prev.filter(i => i !== id))
    } catch (err) {
      alert(`Failed to delete: ${err.message}`)
    }
  }

  if (loading) return <div style={{ ...PAGE, color: T.muted }}>Loading questions...</div>
  if (error) return <div style={{ ...PAGE, color: T.red }}>{error}</div>

  return (
    <div style={PAGE}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1 style={{ margin: 0 }}>Question bank</h1>
        {!hintVisible && (
          <button onClick={showHint} style={{ background: T.surface, border: `${T.bw} solid ${T.border}`, borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', color: T.text, fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>?</button>
        )}
      </div>
      {hintVisible && (
        <HintBanner
          text="These are your saved questions. Filter by topic, edit inline, or delete. Head to Build Quiz when you're ready to assemble them into a quiz."
          onDismiss={dismissHint}
        />
      )}

      {questions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: T.muted, fontSize: '15px', ...card }}>
          No questions yet. Go to Create Question to add some.
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {topics.map(t => (
              <button key={t} onClick={() => setFilter(t)} style={chip(filter === t)}>
                {t} ({t === 'All' ? questions.length : questions.filter(q => q.topic === t).length})
              </button>
            ))}
          </div>

          {filtered.map(q => {
            const topicStyle = TOPIC_COLORS[q.topic] || { bg: T.primarySoft, color: T.text }
            const isSelected = selected.includes(q.id)
            const isEditing = editingId === q.id

            if (isEditing) {
              return (
                <div key={q.id} style={{ padding: '18px', marginBottom: '12px', border: `${T.bw} solid ${T.primary}`, borderRadius: T.radius, background: T.surface, boxShadow: T.shadow }}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={label}>Question</label>
                    <textarea
                      value={editForm.text}
                      onChange={e => setEditForm(f => ({ ...f, text: e.target.value }))}
                      rows={2}
                      style={{ ...input, resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={label}>Options (select correct answer)</label>
                    {editForm.options.map((opt, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={editForm.correctIndex === i}
                          onChange={() => setEditForm(f => ({ ...f, correctIndex: i }))}
                          style={{ accentColor: T.primary, width: '18px', height: '18px' }}
                        />
                        <input
                          value={opt}
                          onChange={e => {
                            const opts = [...editForm.options]
                            opts[i] = e.target.value
                            setEditForm(f => ({ ...f, options: opts }))
                          }}
                          style={{ ...input, flex: 1, border: `2px solid ${editForm.correctIndex === i ? T.primary : T.border}` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={label}>Topic</label>
                    <select
                      value={editForm.topic}
                      onChange={e => setEditForm(f => ({ ...f, topic: e.target.value }))}
                      style={{ ...input, width: 'auto', fontWeight: 600 }}
                    >
                      {ALLOWED_TOPICS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  {editError && (
                    <div style={{ fontSize: '13px', color: T.red, marginBottom: '12px', fontWeight: 600 }}>{editError}</div>
                  )}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => saveEdit(q.id)} disabled={saving} style={{ ...btnPrimary(saving), padding: '10px 20px', fontSize: '14px' }}>
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button onClick={cancelEdit} style={{ ...btnSecondary(), padding: '10px 18px', fontSize: '14px' }}>Cancel</button>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={q.id}
                onClick={() => toggleSelect(q.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '16px 18px', marginBottom: '12px',
                  border: `${T.bw} solid ${T.border}`,
                  borderRadius: T.radius,
                  background: isSelected ? T.primarySoft : T.surface,
                  boxShadow: T.shadowField,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(q.id)}
                  style={{ marginTop: '3px', accentColor: T.primary, width: '18px', height: '18px', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '15px', marginBottom: '8px', lineHeight: 1.5, fontWeight: 500 }}>{q.text}</div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={tag(topicStyle.bg, topicStyle.color)}>{q.topic}</span>
                    <span style={{ fontSize: '12px', color: T.muted }}>{q.options?.length || 4} options</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button onClick={e => startEdit(q, e)} style={{ ...btnSecondary(), padding: '6px 12px', fontSize: '13px' }}>Edit</button>
                  <button onClick={e => deleteQuestion(q.id, e)} style={{ ...btnSecondary(), padding: '6px 12px', fontSize: '13px', color: T.red }}>Delete</button>
                </div>
              </div>
            )
          })}

          {selected.length > 0 && (
            <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: `${T.bw} solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontSize: '14px', color: T.text, fontWeight: 600 }}>{selected.length} question{selected.length > 1 ? 's' : ''} selected</span>
              <button style={btnPrimary()} onClick={() => alert('Add to quiz — coming soon')}>Add to quiz →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default QuestionBank
