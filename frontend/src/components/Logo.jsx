export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
        <circle cx="12" cy="12" r="10" stroke="#1a3a3a" strokeWidth="2" fill="none" />
        <circle cx="12" cy="12" r="5.5" stroke="#1a3a3a" strokeWidth="1.5" fill="none" />
        <circle cx="12" cy="12" r="2.5" fill="#abebd9" />
      </svg>
      <span className="text-lg font-bold leading-none">
        <span style={{ color: '#1a3a3a' }}>Career</span>
        <span style={{ color: '#abebd9' }}>ly</span>
      </span>
    </span>
  )
}
