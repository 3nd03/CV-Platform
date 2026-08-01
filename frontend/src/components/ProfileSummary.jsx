const PROFILE_LABELS = {
  target_role: 'Target role',
  current_skills: 'Current skills',
  background: 'Background',
  experience: 'Experience',
  tools: 'Tools and platforms',
  location: 'Location',
  salary: 'Salary expectations',
  open_to_learning: 'Open to learning',
  timeline: 'Timeline',
  self_gaps: 'Self-identified gaps',
  access_needs: 'Access needs',
}

export default function ProfileSummary({ profile }) {
  const entries = Object.entries(PROFILE_LABELS).filter(([key]) => profile?.[key])

  if (entries.length === 0) {
    return null
  }

  return (
    <div className="border-l-4 border-mint bg-mint-light rounded-r-xl p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {entries.map(([key, label]) => (
          <div key={key}>
            <p className="text-xs uppercase tracking-wide text-label">{label}</p>
            <p className="text-body mt-1">{profile[key]}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
