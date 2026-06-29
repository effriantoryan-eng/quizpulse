// The demo's preset classes. There are no real students — when a quiz is sent to a class,
// that class's answers are generated server-side by /api/simulate (see SendQuiz.jsx).
// Single source of truth: SendQuiz, the Classes page, QuizHistory and the dashboard all read this.
export const PRESET_CLASSES = [
  { id: 'yr9-sci',  name: 'Year 9 Science',  students: 28, topic: 'Science'     },
  { id: 'yr10-mth', name: 'Year 10 Maths',   students: 25, topic: 'Mathematics' },
  { id: 'yr7-eng',  name: 'Year 7 English',  students: 22, topic: 'English'     },
]

export const CLASS_NAMES = Object.fromEntries(PRESET_CLASSES.map(c => [c.id, c.name]))

// Topic accent colours, shared by the class selector and the Classes page.
export const TOPIC_COLORS = {
  Science:     { bg: '#E1F5EE', color: '#085041' },
  Mathematics: { bg: '#E6F1FB', color: '#0C447C' },
  English:     { bg: '#FEF3E2', color: '#7A4100' },
}
