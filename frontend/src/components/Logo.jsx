function TargetMark() {
  return (
    <>
      {/* thin C ring, floating outside the target with a gap, open toward the top right */}
      <path
        d="M 37.39 15.34 A 18 18 0 1 1 24.66 2.61"
        stroke="#1a3a3a"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* closed target rings, separate from the C */}
      <circle cx="20" cy="20" r="13" stroke="#1a3a3a" strokeWidth="3" fill="none" />
      <circle cx="20" cy="20" r="8" stroke="#1a3a3a" strokeWidth="2.2" fill="none" />
      <circle cx="20" cy="20" r="3.5" fill="#abebd9" />
      {/* arrow through the C gap into the centre */}
      <line x1="35.56" y1="4.44" x2="20" y2="20" stroke="#1a3a3a" strokeWidth="2" strokeLinecap="round" />
      <polygon points="20,20 25.66,18.58 21.42,14.34" fill="#1a3a3a" />
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
