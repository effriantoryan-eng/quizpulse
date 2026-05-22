import { useState } from 'react'

const SAMPLE_QUESTIONS = [
  { id: 1, text: 'Which of the following best describes the role of chlorophyll in photosynthesis?', topic: 'Science', options: 4 },
  { id: 2, text: 'What process do plants use to make their own food using sunlight?', topic: 'Science', options: 4 },
  { id: 3, text: 'In what year did the First Fleet arrive in Australia?', topic: 'History', options: 4 },
  { id: 4, text: 'What is the powerhouse of the cell?', topic: 'Science', options: 4 },
  { id: 5, text: 'What is the value of pi to 2 decimal places?', topic: 'Mathematics', options: 4 },
]

const TOPIC_COLORS = {
  Science: { bg: '#E1F5EE', color: '#085041' },
  History: { bg: '#FAEEDA', color: '#633806' },
  Mathematics: { bg: '#E6F1FB', color: '#0C447C' },
  English: { bg: '#FBEAF0', color: '#4B1528' },
  Geography: { bg: '#EEEDFE', color: '#3C3489' },
}

function QuestionBank() {
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState([])

  const topics = ['All', ...new Set(SAMPLE_QUESTIONS.map(q => q.topic))]

  const filtered = filter === 'All'
    ? SAMPLE_QUESTIONS
    : SAMPLE_QUESTIONS.filter(q => q.topic === filter)

  function toggleSelect(id) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px' }}>
      <h2 style={{ marginBottom: '24px' }}>Question bank</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {topics.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: filter === t ? '#534AB7' : '#ddd',
                background: filter === t ? '#534AB7' : 'white',
                color: filter === t ? 'white' : '#555',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: filter === t ? '500' : '400'
              }}
            >
              {t} ({t === 'All' ? SAMPLE_QUESTIONS.length : SAMPLE_QUESTIONS.filter(q => q.topic === t).length})
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
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '14px 16px',
              marginBottom: '10px',
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
                <span style={{ fontSize: '11px', color: '#aaa' }}>{q.options} options</span>
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
            onClick={() => alert('Add to quiz — will connect to Build Quiz screen later')}
          >
            Add to quiz →
          </button>
        </div>
      )}
    </div>
  )
}

export default QuestionBank