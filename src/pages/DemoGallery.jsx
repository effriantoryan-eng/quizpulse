const GALLERY_ITEMS = [
  {
    id: 'student-quiz',
    title: 'Student quiz view',
    desc: 'Students open the quiz link on their phone. Questions are shown one at a time — no login required.',
    emoji: '📱',
    placeholder: 'student-quiz-view.png',
  },
  {
    id: 'student-completion',
    title: 'Completion screen',
    desc: 'After submitting, students see a confirmation. No score is shown — participation only.',
    emoji: '✅',
    placeholder: 'student-completion.png',
  },
  {
    id: 'push-notification',
    title: 'Push notification',
    desc: 'When a teacher sends a quiz, students receive a push notification on iOS and Android via Azure Notification Hubs.',
    emoji: '🔔',
    placeholder: 'push-notification.png',
    badge: 'Post-MVP',
  },
  {
    id: 'schedule-quiz',
    title: 'Scheduled send',
    desc: 'Teachers can schedule a quiz to go out at a future time — useful for homework check-ins or the start of the next lesson.',
    emoji: '🕐',
    placeholder: 'schedule-quiz.png',
    badge: 'Post-MVP',
  },
  {
    id: 'student-login',
    title: 'Student Microsoft login',
    desc: 'Students log in with their school Microsoft account, enabling persistent history and preventing duplicate submissions.',
    emoji: '🔐',
    placeholder: 'student-login.png',
    badge: 'Post-MVP',
  },
  {
    id: 'admin-roster',
    title: 'School admin & rostering',
    desc: 'Admins can bulk-import class lists, manage teacher accounts, and view school-wide participation dashboards.',
    emoji: '🏫',
    placeholder: 'admin-roster.png',
    badge: 'Post-MVP',
  },
]

function PlaceholderImage({ emoji, title }) {
  return (
    <div style={{
      width: '100%',
      aspectRatio: '16/9',
      background: 'linear-gradient(135deg, #f5f4ff 0%, #e8e5ff 100%)',
      borderRadius: '10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      border: '2px dashed #c5c0f0',
      marginBottom: '14px',
    }}>
      <span style={{ fontSize: '36px' }}>{emoji}</span>
      <span style={{ fontSize: '12px', color: '#9990d4', fontStyle: 'italic' }}>
        Screenshot: {title}
      </span>
    </div>
  )
}

export default function DemoGallery() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1433', marginBottom: '8px', letterSpacing: '-0.3px' }}>
          Preview gallery
        </h2>
        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
          Mockups and screenshots showing the student experience and upcoming features.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {GALLERY_ITEMS.map(item => (
          <div
            key={item.id}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #eee',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <PlaceholderImage emoji={item.emoji} title={item.title} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1433' }}>{item.title}</div>
              {item.badge && (
                <span style={{
                  fontSize: '10px', padding: '2px 7px', borderRadius: '20px',
                  background: '#FFF3CD', color: '#856404',
                  fontWeight: '500', whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  {item.badge}
                </span>
              )}
            </div>
            <p style={{ fontSize: '13px', color: '#777', lineHeight: '1.55', margin: 0 }}>{item.desc}</p>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '32px',
        padding: '16px 20px',
        borderRadius: '10px',
        background: '#f8f8f8',
        border: '1px solid #eee',
        fontSize: '13px',
        color: '#888',
        textAlign: 'center',
      }}>
        Replace the placeholder cards above with real screenshots by adding images to <code>public/gallery/</code> and updating <code>DemoGallery.jsx</code>.
      </div>
    </div>
  )
}
