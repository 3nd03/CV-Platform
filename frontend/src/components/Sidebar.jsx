import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ChevronUp, UserPen, Users, History, LogOut } from 'lucide-react'
import { TOOLS } from '../config/tools'
import { logout } from '../api/auth'
import Logo from './Logo'

const SECTION_LABEL_CLASS = 'px-3 pt-5 pb-1 text-[10px] uppercase tracking-wide font-semibold'

const NAV_LINK_CLASS = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
    isActive ? 'bg-mint text-teal font-medium' : 'text-gray-500 hover:bg-mint-light'
  }`

export default function Sidebar() {
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const email = localStorage.getItem('email') || ''
  const displayName = localStorage.getItem('display_name') || email.split('@')[0] || 'Account'
  const initial = (displayName[0] || '?').toUpperCase()

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

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

  function goTo(path) {
    setMenuOpen(false)
    navigate(path)
  }

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-sidebar bg-white border-r border-sidebar-border flex-col z-20">
      <div className="p-6 shrink-0">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-2 space-y-1">
        <p className={`${SECTION_LABEL_CLASS} text-gray-500`}>Navigation</p>
        <NavLink to="/dashboard" className={NAV_LINK_CLASS}>
          <LayoutDashboard size={16} />
          Dashboard
        </NavLink>

        <p className={`${SECTION_LABEL_CLASS} text-gray-500`}>Tools</p>
        {TOOLS.map((tool) => (
          <NavLink key={tool.to} to={tool.to} className={NAV_LINK_CLASS}>
            <tool.icon size={16} />
            <span className="truncate">{tool.name}</span>
          </NavLink>
        ))}
      </nav>

      <div ref={menuRef} className="relative px-4 py-4 border-t border-sidebar-border shrink-0">
        {menuOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-card-border rounded-lg shadow-card py-1 text-sm">
            <button
              type="button"
              onClick={() => goTo('/profile#active-profile')}
              className="w-full flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-mint-light hover:text-teal transition-colors duration-200"
            >
              <UserPen size={16} />
              Edit Profile
            </button>
            <button
              type="button"
              onClick={() => goTo('/profile#your-profiles')}
              className="w-full flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-mint-light hover:text-teal transition-colors duration-200"
            >
              <Users size={16} />
              Switch Profile
            </button>
            <button
              type="button"
              onClick={() => goTo('/profile#history')}
              className="w-full flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-mint-light hover:text-teal transition-colors duration-200"
            >
              <History size={16} />
              History
            </button>
            <div className="border-t border-gray-100 my-1" />
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-mint-light hover:text-teal transition-colors duration-200"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="w-full flex items-center gap-3 text-left"
        >
          <span className="w-9 h-9 shrink-0 rounded-full bg-mint text-teal font-bold flex items-center justify-center">
            {initial}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-teal truncate">{displayName}</span>
            <span className="block text-xs text-gray-500 truncate">{email}</span>
          </span>
          <ChevronUp
            size={14}
            className={`shrink-0 text-gray-500 transition-transform duration-200 ${menuOpen ? '' : 'rotate-180'}`}
          />
        </button>
      </div>
    </aside>
  )
}
