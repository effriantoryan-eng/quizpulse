import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { T } from '../theme'

const COLLAPSE_KEY = 'quizpulse_sidebar_collapsed'

// Inline stroke icons (Feather-style), sized 17px to match the handoff.
const I = {
  home:   <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5Z" />,
  create: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></>,
  bank:   <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
  build:  <><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></>,
  send:   <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>,
  quizzes:<><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>,
  preview:<><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" /><circle cx="12" cy="12" r="3" /></>,
}

const PAGES = [
  { label: 'Home',            icon: I.home,    path: '/'                },
  { label: 'Create Question', icon: I.create,  path: '/teacher/create'  },
  { label: 'Question Bank',   icon: I.bank,    path: '/teacher/bank'    },
  { label: 'Build Quiz',      icon: I.build,   path: '/teacher/build'   },
  { label: 'Send Quiz',       icon: I.send,    path: '/teacher/send'    },
  { label: 'My Quizzes',      icon: I.quizzes, path: '/teacher/quizzes' },
  { label: 'Preview',         icon: I.preview, path: '/demo'            },
]

function Icon({ children }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
         style={{ flexShrink: 0 }} aria-hidden="true">
      {children}
    </svg>
  )
}

export default function DemoNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1')

  function toggleCollapsed() {
    setCollapsed(c => {
      const next = !c
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      return next
    })
  }

  // On mobile the sidebar is a static top bar (CSS), where labels always show
  // regardless of `collapsed`. The `qp-sidebar-collapsed` class scopes the
  // icon-only styling to desktop only.
  return (
    <aside
      className={`qp-sidebar${collapsed ? ' qp-sidebar-collapsed' : ''}`}
      style={{
        width: collapsed ? '72px' : '252px',
        flex: 'none',
        minHeight: '100vh',
        position: 'sticky',
        top: 0,
        background: T.navBg,
        padding: '22px 16px',
        fontFamily: T.font,
        transition: 'width .15s ease',
      }}
    >
      {/* Brand row */}
      <div className="qp-brand" style={{
        display: 'flex', alignItems: 'center', gap: '11px',
        padding: '4px 8px 22px',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div onClick={() => navigate('/')} style={{
          width: '34px', height: '34px', borderRadius: '9px', background: T.logoGrad,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
            <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
          </svg>
        </div>
        <span className="qp-brand-label" style={{ fontWeight: 800, fontSize: '18px', color: T.navText, letterSpacing: '-0.01em', cursor: 'pointer' }}
              onClick={() => navigate('/')}>
          QuizPulse
        </span>
        <span className="qp-brand-label" style={{
          fontSize: '10px', fontWeight: 700, padding: '3px 7px', borderRadius: '5px',
          background: T.badgeBg, color: T.badgeText, textTransform: 'lowercase',
        }}>demo</span>
      </div>

      {/* Collapse toggle (hidden on mobile via CSS) */}
      <button
        className="qp-collapse-btn"
        onClick={toggleCollapsed}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '100%', padding: '7px', marginBottom: '14px',
          background: 'transparent', border: `1.5px solid ${T.navMuted}`,
          borderRadius: '6px', color: T.navMuted, cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = '#ffffff' }}
        onMouseLeave={e => { e.currentTarget.style.color = T.navMuted; e.currentTarget.style.borderColor = T.navMuted }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {collapsed ? <polyline points="9 18 15 12 9 6" /> : <polyline points="15 18 9 12 15 6" />}
        </svg>
      </button>

      {/* Nav items */}
      <nav className="qp-sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {PAGES.map(({ label, icon, path }) => {
          const active = pathname === path ||
            (path !== '/' && pathname.startsWith(path))
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              title={collapsed ? label : undefined}
              aria-label={label}
              style={{
                display: 'flex', alignItems: 'center', gap: '11px',
                padding: '10px 12px', borderRadius: '6px', border: 'none',
                cursor: 'pointer', textAlign: 'left',
                justifyContent: collapsed ? 'center' : 'flex-start',
                fontFamily: T.font, fontSize: '14px',
                fontWeight: active ? 700 : 600,
                background: active ? T.navActiveBg : 'transparent',
                color: active ? T.navActiveText : T.navMuted,
                boxShadow: active ? T.navActiveShadow : 'none',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#ffffff' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = T.navMuted }}
            >
              <Icon>{icon}</Icon>
              <span className="qp-nav-label">{label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
