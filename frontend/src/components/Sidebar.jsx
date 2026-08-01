import { NavLink, useNavigate } from 'react-router-dom'
import { TOOLS } from '../config/tools'
import { logout } from '../api/auth'

const NAV_LINK_CLASS = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
    isActive ? 'bg-mint text-teal font-medium' : 'text-gray-500 hover:bg-mint-light'
  }`

export default function Sidebar() {
  const navigate = useNavigate()

  const email = localStorage.getItem('email') || ''
  const displayName = localStorage.getItem('display_name') || email.split('@')[0] || 'Account'
  const initial = (displayName[0] || '?').toUpperCase()

  async function handleLogout() {
    try {
      await logout()
    } catch {
      // token may already be invalid, proceed to clear it anyway
    }
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    localStorage.removeItem('display_name')
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-sidebar bg-white border-r border-gray-200 flex flex-col z-20">
      <div className="px-4 py-5 flex items-center gap-2 shrink-0">
        <span className="w-8 h-8 rounded-lg bg-mint flex items-center justify-center text-teal font-bold text-sm">
          C
        </span>
        <span className="text-lg font-bold text-teal">Careerly</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <NavLink to="/dashboard" className={NAV_LINK_CLASS}>
          <span className="w-5 text-center">⌂</span>
          Dashboard
        </NavLink>
        <NavLink to="/profile" className={NAV_LINK_CLASS}>
          <span className="w-5 text-center">☺</span>
          Profile
        </NavLink>

        <p className="px-3 pt-4 pb-1 text-xs uppercase tracking-wide text-label font-semibold">Tools</p>
        {TOOLS.map((tool) => (
          <NavLink key={tool.to} to={tool.to} className={NAV_LINK_CLASS}>
            <span className="w-5 text-center">{tool.icon}</span>
            <span className="truncate">{tool.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-200 shrink-0 flex items-center gap-3">
        <span className="w-9 h-9 shrink-0 rounded-full bg-mint text-teal font-bold flex items-center justify-center">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-teal truncate">{displayName}</p>
          <p className="text-xs text-gray-500 truncate">{email}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          title="Log out"
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-mint-light hover:text-teal transition-colors duration-150"
        >
          ⏻
        </button>
      </div>
    </aside>
  )
}
