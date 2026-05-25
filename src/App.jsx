import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useIsAuthenticated } from '@azure/msal-react'
import Login from './pages/Login'
import CreateQuestion from './pages/teacher/CreateQuestion'
import QuestionBank from './pages/teacher/QuestionBank'
import BuildQuiz from './pages/teacher/BuildQuiz'
import SendQuiz from './pages/teacher/SendQuiz'
import TakeQuiz from './pages/student/TakeQuiz'
import Completion from './pages/student/Completion'

function ProtectedRoute({ children }) {
  const isAuthenticated = useIsAuthenticated()
  return isAuthenticated ? children : <Navigate to="/" />
}

function App() {
  const isAuthenticated = useIsAuthenticated()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/teacher/create" /> : <Login />} />
        <Route path="/teacher/create" element={<ProtectedRoute><CreateQuestion /></ProtectedRoute>} />
        <Route path="/teacher/bank" element={<ProtectedRoute><QuestionBank /></ProtectedRoute>} />
        <Route path="/teacher/build" element={<ProtectedRoute><BuildQuiz /></ProtectedRoute>} />
        <Route path="/teacher/send" element={<ProtectedRoute><SendQuiz /></ProtectedRoute>} />
        <Route path="/student/quiz/:id" element={<TakeQuiz />} />
        <Route path="/student/done" element={<Completion />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App