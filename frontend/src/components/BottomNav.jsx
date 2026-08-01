import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Grid, User, FileText, Settings } from 'lucide-react'

// The app has no dedicated "all tools" listing, CV hub, or settings route, and this
// redesign makes no routing changes, so Tools deep-links to the dashboard's tools
// grid via a hash anchor, CV points at the CV Analyser (the most central CV tool),
// and Settings points at the same Profile page as the Profile tab (its Account
// section is the closest thing this app has to settings).
const ITEMS = [
  { label: 'Home', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Tools', icon: Grid, to: '/dashboard#tools-section' },
  { label: 'Profile', icon: User, to: '/profile' },
  { label: 'CV', icon: FileText, to: '/cv-analyser' },
  { label: 'Settings', icon: Settings, to: '/profile' },
]

function isActive(item, location) {
  if (item.to.includes('#')) {
    const [path, hash] = item.to.split('#')
    return location.pathname === path && location.hash === `#${hash}`
  }
  if (item.to === '/dashboard') {
    return location.pathname === '/dashboard' && !location.hash
  }
  return location.pathname === item.to
}

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-sidebar-border flex z-20">
      {ITEMS.map((item) => {
        const active = isActive(item, location)
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => navigate(item.to)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5"
          >
            <item.icon size={20} className={active ? 'text-mint' : 'text-gray-500'} />
            <span className={`text-[10px] ${active ? 'text-mint font-medium' : 'text-gray-500'}`}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
