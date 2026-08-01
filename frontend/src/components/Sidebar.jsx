import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ChevronUp, ChevronLeft, ChevronRight, UserPen, Users, History, LogOut } from 'lucide-react'
import { TOOLS } from '../config/tools'
import { logout } from '../api/auth'
import Logo from './Logo'

function getNavLinkClass(collapsed) {
  return ({ isActive }) =>
    `flex items-center gap-3 rounded-lg text-sm transition-colors duration-200 ${
      collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2'
    } ${isActive ? 'bg-mint text-teal font-medium' : 'text-gray-500 hover:bg-mint-light'}`
}

export default function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const email = localStorage.getItem('email') || ''
  const displayName = localStorage.getItem('display_name') || email.split('@')[0] || 'Account'
  const initial = (displayName[0] || '?').toUpperCase()

  const navLinkClass = getNavLinkClass(collapsed)

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
    <aside
      className={`hidden md:flex fixed left-0 top-0 h-screen bg-white border-r border-sidebar-border flex-col z-20 transition-all duration-200 ${
        collapsed ? 'w-sidebar-collapsed' : 'w-sidebar'
      }`}
    >
      <div className={`shrink-0 flex items-center ${collapsed ? 'flex-col gap-2 py-4' : 'justify-between p-6'}`}>
        <Logo showText={!collapsed} />
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-mint-light hover:text-teal transition-colors duration-200"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-2 space-y-1">
        {collapsed ? (
          <div className="border-t border-sidebar-border mx-1 my-2" />
        ) : (
          <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wide font-semibold text-gray-500">
            Navigation
          </p>
        )}
        <NavLink to="/dashboard" className={navLinkClass} title={collapsed ? 'Dashboard' : undefined}>
          <LayoutDashboard size={16} />
          {!collapsed && 'Dashboard'}
        </NavLink>

        {collapsed ? (
          <div className="border-t border-sidebar-border mx-1 my-2" />
        ) : (
          <p className="px-3 pt-5 pb-1 text-[10px] uppercase tracking-wide font-semibold text-gray-500">Tools</p>
        )}
        {TOOLS.map((tool) => (
          <NavLink key={tool.to} to={tool.to} className={navLinkClass} title={collapsed ? tool.name : undefined}>
            <tool.icon size={16} />
            {!collapsed && <span className="truncate">{tool.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div ref={menuRef} className="relative px-4 py-4 border-t border-sidebar-border shrink-0">
        {menuOpen && (
          <div
            className={`absolute bottom-full mb-2 bg-white border border-card-border rounded-lg shadow-card py-1 text-sm ${
              collapsed ? 'left-2 w-56' : 'left-4 right-4'
            }`}
          >
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
          className={`w-full flex items-center text-left ${collapsed ? 'justify-center' : 'gap-3'}`}
          title={collapsed ? displayName : undefined}
        >
          <span className="w-9 h-9 shrink-0 rounded-full bg-mint text-teal font-bold flex items-center justify-center">
            {initial}
          </span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-teal truncate">{displayName}</span>
                <span className="block text-xs text-gray-500 truncate">{email}</span>
              </span>
              <ChevronUp
                size={14}
                className={`shrink-0 text-gray-500 transition-transform duration-200 ${menuOpen ? '' : 'rotate-180'}`}
              />
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
