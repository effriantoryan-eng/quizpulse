import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE_URL

const QUESTIONS = [
  {
    id: '1',
    text: 'Which of the following best describes the role of chlorophyll in photosynthesis?',
    options: [
      'It absorbs sunlight to power the reaction',
      'It converts CO₂ into glucose',
      'It transports water from roots to leaves',
      'It releases oxygen through transpiration',
    ],
    correctIndex: 1,
  },
  {
    id: '2',
    text: 'What process do plants use to make their own food using sunlight?',
    options: ['Respiration', 'Transpiration', 'Photosynthesis', 'Osmosis'],
    correctIndex: 2,
  },
]

const QUIZ_ID = 'demo-quiz-001'

function TakeQuiz() {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [answers, setAnswers] = useState([])

  const question = QUESTIONS[currentIndex]
  const isLast = currentIndex === QUESTIONS.length - 1

  function handleConfirm() {
    setConfirmed(true)
    setAnswers(prev => [...prev, { questionId: question.id, selectedIndex: selectedOption }])
  }

  async function handleNext() {
    if (isLast) {
      try {
        await fetch(`${API_BASE}/responses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quizId: QUIZ_ID, answers })
        })
      } catch (err) {
        console.error('Failed to save response', err)
      }
      navigate('/student/done')
    } else {
      setCurrentIndex(i => i + 1)
      setSelectedOption(null)
      setConfirmed(false)
    }
  }

  function getOptionStyle(i) {
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

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0' }}>
      <div style={{ background: '#534AB7', padding: '16px 20px', color: 'white' }}>
        <div style={{ fontSize: '11px', opacity: 0.75, marginBottom: '2px' }}>Ms. Santos · Science</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontSize: '15px', fontWeight: '500' }}>Week 4 — Photosynthesis</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Q {currentIndex + 1}/{QUESTIONS.length}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '4px', height: '4px' }}>
          <div style={{ background: 'white', height: '4px', borderRadius: '4px', width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%`, transition: 'width 0.3s' }}></div>
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