import { useNavigate } from 'react-router-dom'

function Completion() {
  const navigate = useNavigate()

  return (
    <div style={{ maxWidth: 380, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>

      {/* Success icon */}
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '32px' }}>
        ✓
      </div>

      <div style={{ fontSize: '22px', fontWeight: '500', color: '#1a1a1a', marginBottom: '8px' }}>All done!</div>
      <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '28px' }}>
        You completed<br />
        <strong style={{ color: '#534AB7' }}>Week 4 — Photosynthesis</strong>
      </div>

      {/* Stats card */}
      <div style={{ background: '#f8f8f8', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', textAlign: 'left' }}>
        <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>This quiz</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginBottom: '8px' }}>
          <span>Questions answered</span>
          <span style={{ fontWeight: '500', color: '#1a1a1a' }}>2 / 2</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555' }}>
          <span>Subject</span>
          <span style={{ fontWeight: '500', color: '#534AB7' }}>Science</span>
        </div>
      </div>

      <div style={{ fontSize: '12px', color: '#aaa', lineHeight: '1.6', marginBottom: '28px' }}>
        No grade recorded.<br />Your teacher can see your participation.
      </div>

      <button
        onClick={() => navigate('/')}
        style={{ padding: '10px 24px', background: '#534AB7', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
      >
        Back to home
      </button>
    </div>
  )
}

export default Completion