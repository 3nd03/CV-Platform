import { Link } from 'react-router-dom'

export default function ToolCard({ to, icon, name, description }) {
  return (
    <Link
      to={to}
      className="block bg-mint-light border border-mint-border rounded-xl p-6 hover:border-mint transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg bg-mint flex items-center justify-center text-teal text-lg">
          {icon}
        </div>
        <span className="text-mint text-xl leading-none">&rarr;</span>
      </div>
      <h3 className="mt-4 font-bold text-teal">{name}</h3>
      <p className="mt-1 text-sm text-body">{description}</p>
    </Link>
  )
}
