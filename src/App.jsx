import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import CreateQuestion from './pages/teacher/CreateQuestion'
import QuestionBank from './pages/teacher/QuestionBank'
import BuildQuiz from './pages/teacher/BuildQuiz'
import SendQuiz from './pages/teacher/SendQuiz'
import TakeQuiz from './pages/student/TakeQuiz'
import Completion from './pages/student/Completion'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/teacher/create" element={<CreateQuestion />} />
        <Route path="/teacher/bank" element={<QuestionBank />} />
        <Route path="/teacher/build" element={<BuildQuiz />} />
        <Route path="/teacher/send" element={<SendQuiz />} />
        <Route path="/student/quiz/:id" element={<TakeQuiz />} />
        <Route path="/student/done" element={<Completion />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App