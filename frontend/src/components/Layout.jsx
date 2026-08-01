import { Link, NavLink, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { TOOLS } from '../config/tools'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/profile': 'Profile',
  ...Object.fromEntries(TOOLS.map((tool) => [tool.to, tool.name])),
}

const TOOL_PATHS = new Set(TOOLS.map((tool) => tool.to))

export default function Layout({ children }) {
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] || 'Careerly'
  const onToolPage = TOOL_PATHS.has(location.pathname)

  const email = localStorage.getItem('email') || ''
  const displayName = localStorage.getItem('display_name') || email.split('@')[0] || 'Account'
  const initial = (displayName[0] || '?').toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div className="pl-sidebar">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-8 py-4">
            <nav className="text-sm text-gray-500">
              <Link to="/dashboard" className="hover:text-teal transition-colors duration-150">
                Careerly
              </Link>
              <span className="mx-2">/</span>
              <span className="text-teal font-medium">{title}</span>
            </nav>

            <div className="flex items-center gap-4">
              <button
                type="button"
                title="Notifications"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-mint-light hover:text-teal transition-colors duration-150"
              >
                🔔
              </button>
              <span className="w-8 h-8 rounded-full bg-mint text-teal font-bold flex items-center justify-center text-sm">
                {initial}
              </span>
            </div>
          </div>

          {onToolPage && (
            <div className="px-8 pb-3 flex gap-2 overflow-x-auto">
              {TOOLS.map((tool) => (
                <NavLink
                  key={tool.to}
                  to={tool.to}
                  className={({ isActive }) =>
                    `shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors duration-150 ${
                      isActive ? 'bg-mint text-teal' : 'bg-gray-50 text-gray-500 hover:bg-mint-light'
                    }`
                  }
                >
                  {tool.name}
                </NavLink>
              ))}
            </div>
          )}
        </header>

        <main className="max-w-content mx-auto px-8 py-8">{children}</main>
      </div>
    </div>
  )
}
