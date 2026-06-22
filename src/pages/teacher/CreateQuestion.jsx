import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useHint } from '../../hooks/useHint'
import HintBanner from '../../components/HintBanner'
import API_BASE from '../../api'
import { T, label, input, chip, btnPrimary, btnSecondary } from '../../theme'

const PAGE = { maxWidth: 860, margin: 0, padding: 'clamp(28px,5vw,42px) clamp(20px,5vw,52px) 80px', fontFamily: T.font }

function CreateQuestion() {
  const { teacherId } = useAuth()
  const [hintVisible, dismissHint, showHint] = useHint('create')
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctIndex, setCorrectIndex] = useState(null)
  const [topic, setTopic] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  const topics = ['Mathematics', 'Science', 'English', 'History', 'Geography']

  function handleOptionChange(index, value) {
    const updated = [...options]
    updated[index] = value
    setOptions(updated)
  }

  function handleReset() {
    setQuestion('')
    setOptions(['', '', '', ''])
    setCorrectIndex(null)
    setTopic('')
    setError(null)
  }

  async function handleSave() {
    if (!question || options.some(o => !o) || correctIndex === null || !topic) {
      setError('Please fill in all fields, select a correct answer and a topic.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: question, options, correctIndex, topic, teacherId })
      })

      if (!res.ok) throw new Error('Failed to save question')

      setSaved(true)
      handleReset()
      setTimeout(() => setSaved(false), 3000)

    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={PAGE}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1 style={{ margin: 0 }}>Create question</h1>
        {!hintVisible && (
          <button onClick={showHint} style={{ background: T.surface, border: `${T.bw} solid ${T.border}`, borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', color: T.text, fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>?</button>
        )}
      </div>
      {hintVisible && (
        <HintBanner
          text="Write a question, fill in four options, mark the correct answer, and choose a topic. Save it — you can create as many as you like before building a quiz."
          onDismiss={dismissHint}
        />
      )}

      {saved && (
        <div style={{ padding: '14px 18px', background: T.greenSoft, color: T.green, border: `${T.bw} solid ${T.border}`, boxShadow: T.shadow, borderRadius: T.radius, marginBottom: '20px', fontSize: '15px', fontWeight: 600 }}>
          ✓ Question saved to bank!
        </div>
      )}

      {error && (
        <div style={{ padding: '14px 18px', background: T.redSoft, color: T.red, border: `${T.bw} solid ${T.border}`, boxShadow: T.shadow, borderRadius: T.radius, marginBottom: '20px', fontSize: '15px', fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '28px' }}>
        <label style={label}>Question</label>
        <textarea
          rows={3}
          style={{ ...input, resize: 'vertical', fontSize: '17px', lineHeight: 1.45 }}
          placeholder="Type your question here…"
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <label style={{ ...label, margin: '0 0 14px' }}>Answer options — select the correct one</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {options.map((opt, i) => {
            const selected = correctIndex === i
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button
                  type="button"
                  onClick={() => setCorrectIndex(i)}
                  aria-label={`Mark option ${String.fromCharCode(65 + i)} correct`}
                  style={{
                    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, padding: 0,
                    border: `2px solid ${selected ? T.primary : T.border}`,
                    background: T.surface, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {selected && <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: T.primary }} />}
                </button>
                <input
                  type="text"
                  style={{
                    ...input, flex: 1, padding: '14px 16px',
                    border: `2px solid ${selected ? T.primary : T.border}`,
                    background: selected ? T.primarySoft : T.surface,
                    fontWeight: selected ? 600 : 500,
                    boxShadow: selected ? 'none' : T.shadowField,
                  }}
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  value={opt}
                  onChange={e => handleOptionChange(i, e.target.value)}
                />
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ marginBottom: '36px' }}>
        <label style={{ ...label, margin: '0 0 14px' }}>Topic tag</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {topics.map(t => (
            <button key={t} onClick={() => setTopic(t)} style={chip(topic === t)}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={handleSave} disabled={saving} style={btnPrimary(saving)}>
          {saving ? 'Saving…' : 'Save question →'}
        </button>
        <button onClick={handleReset} style={{ ...btnSecondary(), color: T.muted }}>Reset</button>
      </div>
    </div>
  )
}

export default CreateQuestion
