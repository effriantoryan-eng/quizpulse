import { useState } from 'react'

const CLASSES = [
  { id: 1, name: 'Year 9 Science — Period 3', students: 28, topic: 'Science' },
  { id: 2, name: 'Year 9 Science — Period 5', students: 26, topic: 'Science' },
  { id: 3, name: 'Year 10 Biology — Period 2', students: 24, topic: 'Science' },
]

const TOPIC_COLORS = {
  Science: { bg: '#E1F5EE', color: '#085041' },
  History: { bg: '#FAEEDA', color: '#633806' },
  Mathematics: { bg: '#E6F1FB', color: '#0C447C' },
}

function SendQuiz() {
  const [selectedClasses, setSelectedClasses] = useState([1])
  const [timing, setTiming] = useState('now')

  function toggleClass(id) {
    setSelectedClasses(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const totalStudents = CLASSES
    .filter(c => selectedClasses.includes(c.id))
    .reduce((sum, c) => sum + c.students, 0)

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px' }}>
      <h2 style={{ marginBottom: '24px' }}>Send quiz</h2>

      {/* Quiz summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', background: '#f8f8f8', borderRadius: '10px', marginBottom: '24px', border: '1px solid #eee' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px' }}>📋</div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '500' }}>Week 4 — Photosynthesis check-in</div>
          <div style={{ fontSize: '12px', color: '#888' }}>2 questions · Science</div>
        </div>
      </div>

      {/* Class selector */}
      <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '10px' }}>Send to class</div>

      {CLASSES.map(c => {
        const isSelected = selectedClasses.includes(c.id)
        const topicStyle = TOPIC_COLORS[c.topic] || { bg: '#EEEDFE', color: '#3C3489' }
        return (
          <div
            key={c.id}
            onClick={() => toggleClass(c.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              marginBottom: '8px',
              border: `${isSelected ? '2px' : '1px'} solid ${isSelected ? '#534AB7' : '#e0e0e0'}`,
              borderRadius: '8px',
              background: isSelected ? '#EEEDFE11' : 'white',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%',
              border: `1px solid ${isSelected ? '#534AB7' : '#ccc'}`,
              background: isSelected ? '#534AB7' : 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, fontSize: '12px', color: 'white'
            }}>
              {isSelected ? '✓' : ''}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{c.name}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>{c.students} students</div>
            </div>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: topicStyle.bg, color: topicStyle.color }}>{c.topic}</span>
          </div>
        )
      })}

      {/* Timing */}
      <div style={{ borderTop: '1px solid #eee', margin: '20px 0' }}></div>
      <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '10px' }}>When to send</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
        <div
          onClick={() => setTiming('now')}
          style={{
            padding: '14px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer',
            border: `${timing === 'now' ? '2px' : '1px'} solid ${timing === 'now' ? '#534AB7' : '#e0e0e0'}`,
            background: timing === 'now' ? '#EEEDFE22' : 'white'
          }}
        >
          <div style={{ fontSize: '20px', marginBottom: '6px' }}>📤</div>
          <div style={{ fontSize: '13px', fontWeight: '500', color: timing === 'now' ? '#534AB7' : '#333' }}>Send now</div>
        </div>
        <div
          onClick={() => setTiming('later')}
          style={{
            padding: '14px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer',
            border: `${timing === 'later' ? '2px' : '1px'} solid ${timing === 'later' ? '#534AB7' : '#e0e0e0'}`,
            background: timing === 'later' ? '#EEEDFE22' : 'white'
          }}
        >
          <div style={{ fontSize: '20px', marginBottom: '6px' }}>🕐</div>
          <div style={{ fontSize: '13px', fontWeight: '500', color: timing === 'later' ? '#534AB7' : '#333' }}>Schedule</div>
        </div>
      </div>

      {/* Send button */}
      <button
        disabled={selectedClasses.length === 0}
        style={{
          width: '100%', padding: '12px',
          background: selectedClasses.length === 0 ? '#ccc' : '#534AB7',
          color: 'white', border: 'none', borderRadius: '8px',
          fontSize: '15px', fontWeight: '500', cursor: selectedClasses.length === 0 ? 'not-allowed' : 'pointer'
        }}
        onClick={() => alert(`Quiz sent to ${totalStudents} students!`)}
      >
        Send to {totalStudents} students →
      </button>

      <p style={{ fontSize: '12px', color: '#aaa', textAlign: 'center', marginTop: '10px' }}>
        Students receive a push notification. No grade is recorded.
      </p>
    </div>
  )
}

export default SendQuiz