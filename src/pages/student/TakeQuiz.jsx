import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import API_BASE from '../../api'

function TakeQuiz() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [answers, setAnswers] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const quizRes = await fetch(`${API_BASE}/quizzes/${id}`)
        if (quizRes.status === 404) throw new Error('Quiz not found')
        if (!quizRes.ok) throw new Error(`Server error ${quizRes.status}`)
        const quizData = await quizRes.json()

        const questionsRes = await fetch(`${API_BASE}/questions?teacherId=${quizData.teacherId}`)
        if (!questionsRes.ok) throw new Error(`Server error ${questionsRes.status}`)
        const allQuestions = await questionsRes.json()

        const ordered = quizData.questionIds
          .map(qid => allQuestions.find(q => q.id === qid))
          .filter(Boolean)

        if (ordered.length === 0) throw new Error('This quiz has no questions')

        setQuiz(quizData)
        setQuestions(ordered)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  function handleConfirm() {
    setConfirmed(true)
    setAnswers(prev => [...prev, { questionId: questions[currentIndex].id, selectedIndex: selectedOption }])
  }

  async function handleNext() {
    const isLast = currentIndex === questions.length - 1
    if (isLast) {
      try {
        const res = await fetch(`${API_BASE}/responses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quizId: id, answers }),
        })
        // 409 means already submitted — still send to done screen, quiz is complete
        if (!res.ok && res.status !== 409) {
          console.error('Failed to save response', res.status)
        }
      } catch (err) {
        console.error('Failed to save response', err)
      }
      navigate('/student/done', { state: { quizName: quiz.name, questionCount: questions.length } })
    } else {
      setCurrentIndex(i => i + 1)
      setSelectedOption(null)
      setConfirmed(false)
    }
  }

  function getOptionStyle(i) {
    const question = questions[currentIndex]
    const base = {
      width: '100%', textAlign: 'left', padding: '10px 14px', marginBottom: '8px',
      borderRadius: '10px', fontSize: '14px', cursor: confirmed ? 'default' : 'pointer',
      display: 'flex', alignItems: 'center', gap: '10px', boxSizing: 'border-box',
      border: '1.5px solid #e0e0e0', background: 'white', color: '#333',
    }
    if (!confirmed) {
      if (selectedOption === i) return { ...base, border: '1.5px solid #534AB7', background: '#EEEDFE', color: '#3C3489' }
      return base
    }
    if (i === question.correctIndex) return { ...base, border: '1.5px solid #3B6D11', background: '#EAF3DE', color: '#27500A' }
    if (i === selectedOption && i !== question.correctIndex) return { ...base, border: '1.5px solid #A32D2D', background: '#FCEBEB', color: '#501313' }
    return base
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px', color: '#888', fontSize: '14px' }}>
        Loading quiz…
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px' }}>
        <div style={{ color: '#c0392b', fontSize: '14px', marginBottom: '12px' }}>{error}</div>
        <button
          onClick={() => navigate('/')}
          style={{ padding: '10px 20px', background: '#534AB7', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
        >
          Go home
        </button>
      </div>
    )
  }

  const question = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0' }}>
      <div style={{ background: '#534AB7', padding: '16px 20px', color: 'white' }}>
        <div style={{ fontSize: '11px', opacity: 0.75, marginBottom: '2px' }}>{question.topic}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontSize: '15px', fontWeight: '500' }}>{quiz.name}</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Q {currentIndex + 1}/{questions.length}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '4px', height: '4px' }}>
          <div style={{ background: 'white', height: '4px', borderRadius: '4px', width: `${((currentIndex + 1) / questions.length) * 100}%`, transition: 'width 0.3s' }}></div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ fontSize: '15px', fontWeight: '500', lineHeight: '1.5', marginBottom: '16px', color: '#1a1a1a' }}>
          {question.text}
        </div>
        {question.options.map((opt, i) => (
          <button key={i} style={getOptionStyle(i)} onClick={() => !confirmed && setSelectedOption(i)}>
            <span style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1.5px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>
              {String.fromCharCode(65 + i)}
            </span>
            {opt}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        {!confirmed ? (
          <button
            disabled={selectedOption === null}
            onClick={handleConfirm}
            style={{ width: '100%', padding: '12px', background: selectedOption === null ? '#ccc' : '#534AB7', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: selectedOption === null ? 'not-allowed' : 'pointer' }}
          >
            Confirm answer
          </button>
        ) : (
          <button onClick={handleNext} style={{ width: '100%', padding: '12px', background: '#534AB7', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
            {isLast ? 'Finish quiz →' : 'Next question →'}
          </button>
        )}
        <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '11px', color: '#aaa' }}>
          No grade is recorded · just for learning
        </div>
      </div>
    </div>
  )
}

export default TakeQuiz
