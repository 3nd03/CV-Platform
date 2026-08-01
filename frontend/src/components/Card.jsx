export default function Card({ children, className = '', hoverable = false }) {
  return (
    <div
      className={`bg-white border border-card-border rounded-2xl shadow-card p-6 ${
        hoverable ? 'transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
