import { useState } from 'react'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

const COLLAPSE_KEY = 'sidebar_collapsed'

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1')

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      return next
    })
  }

  return (
    <div className="min-h-screen bg-page-bg">
      <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />

      <div
        className={`pb-20 md:pb-0 transition-all duration-200 ${
          collapsed ? 'md:pl-sidebar-collapsed' : 'md:pl-sidebar'
        }`}
      >
        <main className="max-w-content mx-auto px-4 md:px-8 py-6 md:py-8">{children}</main>
      </div>

      <BottomNav />
    </div>
  )
}
