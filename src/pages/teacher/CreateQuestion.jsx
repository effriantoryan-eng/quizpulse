import { teacherId } from '../../session'
import { useState } from 'react'

const API_BASE = "https://quizpulse-api-b5bvbvgzdph6dyas.australiaeast-01.azurewebsites.net/api";

function CreateQuestion() {
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
      setQuestion('')
      setOptions(['', '', '', ''])
      setCorrectIndex(null)
      setTopic('')
      setTimeout(() => setSaved(false), 3000)

    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px' }}>
      <h2 style={{ marginBottom: '24px' }}>Create question</h2>

      {saved && (
        <div style={{ padding: '10px 14px', background: '#EAF3DE', color: '#3B6D11', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
          ✓ Question saved to bank!
        </div>
      )}

      {error && (
        <div style={{ padding: '10px 14px', background: '#FCEBEB', color: '#A32D2D', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#888' }}>Question</label>
        <textarea
          rows={3}
          style={{ width: '100%', padding: '10px', fontSize: '14px', boxSizing: 'border-box' }}
          placeholder="Type your question here…"
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#888' }}>Answer options — select the correct one</label>
        {options.map((opt, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <input
              type="radio"
              name="correct"
              checked={correctIndex === i}
              onChange={() => setCorrectIndex(i)}
            />
            <input
              type="text"
              style={{ flex: 1, padding: '8px 10px', fontSize: '14px' }}
              placeholder={`Option ${String.fromCharCode(65 + i)}`}
              value={opt}
              onChange={e => handleOptionChange(i, e.target.value)}
            />
            {correctIndex === i && (
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#EAF3DE', color: '#3B6D11' }}>Correct</span>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#888' }}>Topic tag</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {topics.map(t => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              style={{
                padding: '4px 12px', borderRadius: '20px',
                border: '1px solid #AFA9EC',
                background: topic === t ? '#534AB7' : '#EEEDFE',
                color: topic === t ? 'white' : '#3C3489',
                cursor: 'pointer', fontSize: '13px'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{ width: '100%', padding: '12px', background: saving ? '#aaa' : '#534AB7', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer' }}
      >
        {saving ? 'Saving...' : 'Save to question bank'}
      </button>
    </div>
  )
}

export default CreateQuestion