import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function BackButton() {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate('/dashboard')}
      className="flex items-center gap-1 text-gray-500 hover:text-teal transition-colors duration-200 mb-4"
    >
      <ChevronLeft size={20} />
      <span className="text-sm">Back to Dashboard</span>
    </button>
  )
}
