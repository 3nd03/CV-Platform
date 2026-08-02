function TargetMark() {
  return (
    <>
      {/* outer ring, open on the right to form the C */}
      <path d="M 33 31 A 17 17 0 1 1 33 9" stroke="#1a3a3a" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="20" cy="20" r="11" stroke="#1a3a3a" strokeWidth="2.5" fill="none" />
      <circle cx="20" cy="20" r="6" stroke="#1a3a3a" strokeWidth="2" fill="none" />
      <circle cx="20" cy="20" r="3" fill="#abebd9" />
      <line x1="33.4" y1="6.6" x2="20" y2="20" stroke="#1a3a3a" strokeWidth="2" strokeLinecap="round" />
      <polygon points="20,20 24.6,18.9 21.1,15.4" fill="#1a3a3a" />
    </>
  )
}

export default function Logo({ className = '', showText = true }) {
  if (!showText) {
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        className={`shrink-0 ${className}`}
      >
        <TargetMark />
      </svg>
    )
  }

  return (
    <svg
      width="140"
      height="40"
      viewBox="0 0 140 40"
      fill="none"
      role="img"
      aria-label="Careerly"
      className={`shrink-0 ${className}`}
    >
      <TargetMark />
      <text x="44" y="28" fontFamily="'Nunito', sans-serif" fontWeight="800" fontSize="26">
        <tspan fill="#1a3a3a">areer</tspan>
        <tspan fill="#abebd9">ly</tspan>
      </text>
    </svg>
  )
}
