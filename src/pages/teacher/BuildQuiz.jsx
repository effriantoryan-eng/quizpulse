import { useState } from 'react'

const INITIAL_QUESTIONS = [
  { id: 1, text: 'Which of the following best describes the role of chlorophyll in photosynthesis?', topic: 'Science' },
  { id: 2, text: 'What process do plants use to make their own food using sunlight?', topic: 'Science' },
]

const TOPIC_COLORS = {
  Science: { bg: '#E1F5EE', color: '#085041' },
  History: { bg: '#FAEEDA', color: '#633806' },
  Mathematics: { bg: '#E6F1FB', color: '#0C447C' },
  English: { bg: '#FBEAF0', color: '#4B1528' },
  Geography: { bg: '#EEEDFE', color: '#3C3489' },
}

function BuildQuiz() {
  const [quizName, setQuizName] = useState('Week 4 — Photosynthesis check-in')
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS)
  const [previewIndex, setPreviewIndex] = useState(0)

  function moveUp(index) {
    if (index === 0) return
    const updated = [...questions]
    ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    setQuestions(updated)
    if (previewIndex === index) setPreviewIndex(index - 1)
  }

  function moveDown(index) {
    if (index === questions.length - 1) return
    const updated = [...questions]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    setQuestions(updated)
    if (previewIndex === index) setPreviewIndex(index + 1)
  }

  function removeQuestion(id) {
    setQuestions(prev => prev.filter(q => q.id !== id))
    setPreviewIndex(0)
  }

  const previewQuestion = questions[previewIndex]

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px' }}>
      <h2 style={{ marginBottom: '24px' }}>Build quiz</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Left — quiz details and questions */}
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#888' }}>Quiz name</label>
            <input
              type="text"
              value={quizName}
              onChange={e => setQuizName(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', marginBottom: '10px' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '10px' }}>
              Selected questions ({questions.length})
            </div>

            {questions.length === 0 && (
              <div style={{ fontSize: '13px', color: '#aaa', padding: '16px', textAlign: 'center', border: '1px dashed #ddd', borderRadius: '8px' }}>
                No questions added yet
              </div>
            )}

            {questions.map((q, i) => {
              const topicStyle = TOPIC_COLORS[q.topic] || { bg: '#EEEDFE', color: '#3C3489' }
              return (
                <div
                  key={q.id}
                  onClick={() => setPreviewIndex(i)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    marginBottom: '8px',
                    border: `1px solid ${previewIndex === i ? '#534AB7' : '#e0e0e0'}`,
                    borderRadius: '8px',
                    background: previewIndex === i ? '#EEEDFE22' : 'white',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#666', flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ flex: 1, lineHeight: '1.4' }}>{q.text}</span>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: topicStyle.bg, color: topicStyle.color, flexShrink: 0 }}>{q.topic}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button onClick={e => { e.stopPropagation(); moveUp(i) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#888', padding: '1px 4px' }}>▲</button>
                    <button onClick={e => { e.stopPropagation(); moveDown(i) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#888', padding: '1px 4px' }}>▼</button>
                  </div>
                  <button onClick={e => { e.stopPropagation(); removeQuestion(q.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#ccc', padding: '2px 6px' }}>×</button>
                </div>
              )
            })}

            <div
              style={{ border: '1px dashed #ddd', borderRadius: '8px', padding: '12px', textAlign: 'center', fontSize: '13px', color: '#aaa', cursor: 'pointer', marginTop: '4px' }}
              onClick={() => alert('Will navigate to Question Bank')}
            >
              + Add more from bank
            </div>
          </div>
        </div>

        {/* Right — preview */}
        <div>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '10px' }}>
            Preview — student view
          </div>
          <div style={{ background: '#f8f8f8', borderRadius: '12px', padding: '16px', border: '1px solid #eee' }}>
            {previewQuestion ? (
              <>
                <div style={{ fontSize: '11px', color: '#aaa', textAlign: 'center', marginBottom: '10px' }}>
                  Question {previewIndex + 1} of {questions.length}
                </div>
                <div style={{ background: 'white', borderRadius: '8px', padding: '14px', marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                  {previewQuestion.text}
                </div>
                {['Option A', 'Option B', 'Option C', 'Option D'].map((opt, i) => (
                  <div key={i} style={{ background: i === 1 ? '#EEEDFE' : 'white', border: `1px solid ${i === 1 ? '#534AB7' : '#eee'}`, borderRadius: '8px', padding: '10px 14px', marginBottom: '8px', fontSize: '13px', color: i === 1 ? '#3C3489' : '#333' }}>
                    {opt}
                  </div>
                ))}
              </>
            ) : (
              <div style={{ fontSize: '13px', color: '#aaa', textAlign: 'center', padding: '24px' }}>No questions to preview</div>
            )}
          </div>

          <button
            style={{ width: '100%', marginTop: '16px', padding: '12px', background: '#534AB7', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
            onClick={() => alert('Save and go to Send Quiz — will connect later')}
          >
            Save & go to send →
          </button>
        </div>
      </div>
    </div>
  )
}

export default BuildQuiz