import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

import API_BASE from '../../api'

const TOPIC_COLORS = {
  Science: { bg: '#E1F5EE', color: '#085041' },
  History: { bg: '#FAEEDA', color: '#633806' },
  Mathematics: { bg: '#E6F1FB', color: '#0C447C' },
}

function SendQuiz() {
  const { teacherId } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const routerState = location.state || {}
  const { quizName = '', questionIds = [] } = routerState

  const [classes, setClasses] = useState([])
  const [selectedClasses, setSelectedClasses] = useState([])
  const [timing, setTiming] = useState('now')
  const [sending, setSending] = useState(false)
  const [sentQuizId, setSentQuizId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch(`${API_BASE}/classes`)
        if (!res.ok) return
        const data = await res.json()
        setClasses(data)
        if (data.length > 0) setSelectedClasses([data[0].id])
      } catch {
        // silently fail — class list stays empty
      }
    }
    fetchClasses()
  }, [])

  if (!quizName || questionIds.length === 0) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>Send quiz</h2>
        <p style={{ fontSize: '14px', color: '#888', marginBottom: '16px' }}>
          No quiz to send. Please build a quiz first.
        </p>
        <button
          onClick={() => navigate('/teacher/build')}
          style={{ padding: '10px 20px', background: '#534AB7', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
        >
          Go to Build quiz
        </button>
      </div>
    )
  }

  function toggleClass(id) {
    setSelectedClasses(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const totalStudents = classes
    .filter(c => selectedClasses.includes(c.id))
    .reduce((sum, c) => sum + c.students, 0)

  async function handleSend() {
    setError(null)
    setSending(true)
    try {
      const res = await fetch(`${API_BASE}/quizzes`, {
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
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const quiz = await res.json()
      setSentQuizId(quiz.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const studentLink = sentQuizId
    ? `${window.location.origin}/student/quiz/${sentQuizId}`
    : null

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px' }}>
      <h2 style={{ marginBottom: '24px' }}>Send quiz</h2>

      {/* Quiz summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', background: '#f8f8f8', borderRadius: '10px', marginBottom: '24px', border: '1px solid #eee' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px' }}>📋</div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '500' }}>{quizName}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{questionIds.length} question{questionIds.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {sentQuizId ? (
        /* Success state */
        <div style={{ background: '#E1F5EE', border: '1px solid #085041', borderRadius: '10px', padding: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#085041', marginBottom: '8px' }}>Quiz sent!</div>
          <div style={{ fontSize: '13px', color: '#085041', marginBottom: '14px' }}>
            Share this link with your students:
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              readOnly
              value={studentLink}
              style={{ flex: 1, padding: '8px 10px', fontSize: '12px', border: '1px solid #085041', borderRadius: '6px', background: 'white', color: '#333' }}
              onFocus={e => e.target.select()}
            />
            <button
              onClick={() => navigator.clipboard.writeText(studentLink)}
              style={{ padding: '8px 12px', background: '#085041', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Copy
            </button>
          </div>
          <button
            onClick={() => navigate(`/teacher/analytics/${sentQuizId}`)}
            style={{ width: '100%', marginTop: '14px', padding: '10px', background: 'white', color: '#085041', border: '1px solid #085041', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
          >
            View analytics →
          </button>
        </div>
      ) : (
        <>
          {/* Class selector */}
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '10px' }}>Send to class</div>

          {classes.map(c => {
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
                padding: '14px', textAlign: 'center', borderRadius: '8px', cursor: 'not-allowed',
                border: '1px solid #e0e0e0',
                background: '#fafafa',
                opacity: 0.5
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>🕐</div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#aaa' }}>Schedule</div>
              <div style={{ fontSize: '11px', color: '#bbb' }}>Coming soon</div>
            </div>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: '#fdecea', border: '1px solid #c0392b', borderRadius: '8px', fontSize: '13px', color: '#c0392b', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {/* Send button */}
          <button
            disabled={selectedClasses.length === 0 || sending}
            style={{
              width: '100%', padding: '12px',
              background: selectedClasses.length === 0 || sending ? '#ccc' : '#534AB7',
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '15px', fontWeight: '500', cursor: selectedClasses.length === 0 || sending ? 'not-allowed' : 'pointer'
            }}
            onClick={handleSend}
          >
            {sending ? 'Sending…' : `Send to ${totalStudents} students →`}
          </button>

          <p style={{ fontSize: '12px', color: '#aaa', textAlign: 'center', marginTop: '10px' }}>
            Students receive a link to the quiz. No grade is recorded.
          </p>
        </>
      )}
    </div>
  )
}

export default SendQuiz
