import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CreateQuestion from './pages/teacher/CreateQuestion'
import QuestionBank from './pages/teacher/QuestionBank'
import BuildQuiz from './pages/teacher/BuildQuiz'
import SendQuiz from './pages/teacher/SendQuiz'
import TakeQuiz from './pages/student/TakeQuiz'
import Completion from './pages/student/Completion'
import Analytics from './pages/teacher/Analytics'
import DemoNav from './components/DemoNav'

function App() {
  return (
    <BrowserRouter>
      <DemoNav />
      <Routes>
        <Route path="/" element={<CreateQuestion />} />
        <Route path="/teacher/create" element={<CreateQuestion />} />
        <Route path="/teacher/bank" element={<QuestionBank />} />
        <Route path="/teacher/build" element={<BuildQuiz />} />
        <Route path="/teacher/send" element={<SendQuiz />} />
        <Route path="/teacher/analytics/:quizId" element={<Analytics />} />
        <Route path="/student/quiz/:id" element={<TakeQuiz />} />
        <Route path="/student/done" element={<Completion />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App