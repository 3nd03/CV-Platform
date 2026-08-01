import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-page-bg">
      <Sidebar />

      <div className="md:pl-sidebar pb-20 md:pb-0">
        <main className="max-w-content mx-auto px-4 md:px-8 py-6 md:py-8">{children}</main>
      </div>

      <BottomNav />
    </div>
  )
}
