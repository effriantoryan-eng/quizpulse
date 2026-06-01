import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const API_BASE = "https://quizpulse-api-b5bvbvgzdph6dyas.australiaeast-01.azurewebsites.net/api";

const TOPIC_COLORS = {
  Science: { bg: '#E1F5EE', color: '#085041' },
  History: { bg: '#FAEEDA', color: '#633806' },
  Mathematics: { bg: '#E6F1FB', color: '#0C447C' },
  English: { bg: '#FBEAF0', color: '#4B1528' },
  Geography: { bg: '#EEEDFE', color: '#3C3489' },
}

function QuestionBank() {
  const { teacherId } = useAuth()
  const [questions, setQuestions] = useState([])
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  const filtered = filter === 'All'
    ? questions
    : questions.filter(q => q.topic === filter)

  function toggleSelect(id) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  if (loading) return <div style={{ padding: '24px', color: '#888' }}>Loading questions...</div>
  if (error) return <div style={{ padding: '24px', color: '#A32D2D' }}>{error}</div>

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px' }}>
      <h2 style={{ marginBottom: '24px' }}>Question bank</h2>

      {questions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#aaa', fontSize: '14px' }}>
          No questions yet. Go to Create Question to add some.
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {topics.map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  style={{
                    padding: '5px 12px', borderRadius: '20px', border: '1px solid',
                    borderColor: filter === t ? '#534AB7' : '#ddd',
                    background: filter === t ? '#534AB7' : 'white',
                    color: filter === t ? 'white' : '#555',
                    cursor: 'pointer', fontSize: '12px',
                    fontWeight: filter === t ? '500' : '400'
                  }}
                >
                  {t} ({t === 'All' ? questions.length : questions.filter(q => q.topic === t).length})
                </button>
              ))}
            </div>
          </div>

          {filtered.map(q => {
            const topicStyle = TOPIC_COLORS[q.topic] || { bg: '#EEEDFE', color: '#3C3489' }
            const isSelected = selected.includes(q.id)
            return (
              <div
                key={q.id}
                onClick={() => toggleSelect(q.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '14px 16px', marginBottom: '10px',
                  border: `1px solid ${isSelected ? '#534AB7' : '#e0e0e0'}`,
                  borderRadius: '10px',
                  background: isSelected ? '#EEEDFE22' : 'white',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(q.id)}
                  style={{ marginTop: '3px', accentColor: '#534AB7' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', marginBottom: '6px', lineHeight: '1.5' }}>{q.text}</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: topicStyle.bg, color: topicStyle.color }}>{q.topic}</span>
                    <span style={{ fontSize: '11px', color: '#aaa' }}>{q.options?.length || 4} options</span>
                  </div>
                </div>
              </div>
            )
          })}

          {selected.length > 0 && (
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#666' }}>{selected.length} question{selected.length > 1 ? 's' : ''} selected</span>
              <button
                style={{ padding: '8px 18px', background: '#534AB7', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
                onClick={() => alert('Add to quiz — coming soon')}
              >
                Add to quiz →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default QuestionBank