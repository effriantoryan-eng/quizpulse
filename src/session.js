export function getSessionId(key) {
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(key, id)
  }
  return id
}

export const studentId = getSessionId('quizpulse_student_id')