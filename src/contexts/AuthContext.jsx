import { createContext, useContext, useState, useEffect } from 'react'
import { getSessionId } from '../session'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [teacherId, setTeacherId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAuth() {
      try {
        const res = await fetch('/.auth/me')
        if (res.ok) {
          const data = await res.json()
          if (data.clientPrincipal) {
            setUser(data.clientPrincipal)
            setTeacherId(data.clientPrincipal.userId)
            return
          }
        }
      } catch {
        // /.auth/me unreachable — local dev without auth
      }
      // Local dev fallback: stable sessionStorage UUID
      setTeacherId(getSessionId('quizpulse_teacher_id'))
    }
    loadAuth().finally(() => setLoading(false))
  }, [])

  return (
    <AuthContext.Provider value={{ user, teacherId, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
