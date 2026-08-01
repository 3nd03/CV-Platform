import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../api/auth'

export default function Layout({ children }) {
  const navigate = useNavigate()

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
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b-2 border-mint">
        <div className="max-w-[720px] mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-xl font-bold text-teal">
            Careerly
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="text-teal border border-mint-border rounded-lg px-4 py-2 bg-white hover:bg-mint-light"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="max-w-[720px] mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
