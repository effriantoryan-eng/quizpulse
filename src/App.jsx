import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import CreateQuestion from './pages/teacher/CreateQuestion'
import QuestionBank from './pages/teacher/QuestionBank'
import BuildQuiz from './pages/teacher/BuildQuiz'
import SendQuiz from './pages/teacher/SendQuiz'
import TakeQuiz from './pages/student/TakeQuiz'
import Completion from './pages/student/Completion'
import Analytics from './pages/teacher/Analytics'
import DemoNav from './components/DemoNav'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const isLocalDev = window.location.hostname === 'localhost'

  if (loading) return null

  if (!user && !isLocalDev) {
    window.location.href = `/.auth/login/aad?post_login_redirect_uri=${encodeURIComponent(window.location.pathname)}`
    return null
  }

  return children
}

function AppRoutes() {
  return (
    <>
      <DemoNav />
      <Routes>
        <Route path="/" element={<ProtectedRoute><CreateQuestion /></ProtectedRoute>} />
        <Route path="/teacher/create" element={<ProtectedRoute><CreateQuestion /></ProtectedRoute>} />
        <Route path="/teacher/bank" element={<ProtectedRoute><QuestionBank /></ProtectedRoute>} />
        <Route path="/teacher/build" element={<ProtectedRoute><BuildQuiz /></ProtectedRoute>} />
        <Route path="/teacher/send" element={<ProtectedRoute><SendQuiz /></ProtectedRoute>} />
        <Route path="/teacher/analytics/:quizId" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/student/quiz/:id" element={<TakeQuiz />} />
        <Route path="/student/done" element={<Completion />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
