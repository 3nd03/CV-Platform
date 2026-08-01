import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Card from '../components/Card'
import { getProfile } from '../api/profile'
import { TOOLS } from '../config/tools'
import { getToolsUsedCount } from '../utils/toolActivity'

const PROFILE_FIELD_KEYS = [
  'target_role',
  'current_skills',
  'background',
  'experience',
  'tools',
  'location',
  'salary',
  'open_to_learning',
  'timeline',
  'self_gaps',
  'access_needs',
]

function greetingForNow() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function MetricCard({ border, bar, label, value, subtext, pct }) {
  return (
    <div className={`bg-white rounded-xl shadow-card border-t-4 ${border} overflow-hidden`}>
      <div className="p-5">
        <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{label}</p>
        <p className="text-2xl font-bold text-teal mt-2">{value}</p>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
      </div>
      <div className="h-1.5 bg-gray-100">
        <div className={`h-full ${bar} transition-all duration-150`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProfile()
      .then((data) => setProfile(data))
      .catch((err) => {
        if (err.response?.status === 404) {
          navigate('/onboarding')
        }
      })
      .finally(() => setLoading(false))
  }, [navigate])

  const email = localStorage.getItem('email') || ''
  const greetingName = localStorage.getItem('display_name') || email.split('@')[0]

  if (loading) {
    return (
      <Layout>
        <p className="text-body">Loading...</p>
      </Layout>
    )
  }

  const data = profile?.data || {}
  const filledCount = PROFILE_FIELD_KEYS.filter((key) => data[key]).length
  const profilePct = Math.round((filledCount / PROFILE_FIELD_KEYS.length) * 100)
  const profileIncomplete = filledCount < PROFILE_FIELD_KEYS.length

  const skillGapScore = sessionStorage.getItem('skill_gap_score')
  const skillGapPct = skillGapScore ? parseInt(skillGapScore, 10) || 0 : 0

  const toolsUsed = getToolsUsedCount()
  const toolsUsedPct = Math.round((toolsUsed / TOOLS.length) * 100)

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-teal">
        {greetingForNow()}{greetingName ? `, ${greetingName}` : ''}
      </h1>
      <p className="text-gray-500 mt-1">Here's your career overview</p>

      {profileIncomplete && (
        <div className="mt-6 bg-mint-light border border-mint rounded-xl p-4 flex items-center gap-4">
          <span className="w-10 h-10 shrink-0 rounded-full bg-mint flex items-center justify-center text-teal text-lg">
            !
          </span>
          <p className="flex-1 text-body text-sm">
            Your profile is {profilePct}% complete. Fill in the rest to get sharper results from every tool.
          </p>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="shrink-0 bg-mint text-teal rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150"
          >
            Complete profile
          </button>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          border="border-mint"
          bar="bg-mint"
          label="Skill Gap Score"
          value={skillGapScore || 'N/A'}
          subtext={skillGapScore ? 'From your last analysis' : 'Not run yet'}
          pct={skillGapPct}
        />
        <MetricCard
          border="border-teal"
          bar="bg-teal"
          label="Target Role"
          value={data.target_role || 'Not set'}
          subtext={data.target_role ? 'Current focus' : 'Set this in onboarding'}
          pct={data.target_role ? 100 : 0}
        />
        <MetricCard
          border="border-purple"
          bar="bg-purple"
          label="Tools Used"
          value={`${toolsUsed} / ${TOOLS.length}`}
          subtext="This session"
          pct={toolsUsedPct}
        />
        <MetricCard
          border="border-gold"
          bar="bg-gold"
          label="Profile Complete"
          value={`${profilePct}%`}
          subtext={`${filledCount} of ${PROFILE_FIELD_KEYS.length} fields`}
          pct={profilePct}
        />
      </div>

      <div className="mt-10 flex items-center gap-2">
        <h2 className="text-lg font-bold text-teal">Your tools</h2>
        <span className="bg-mint-light text-teal text-xs font-semibold px-2 py-0.5 rounded-full">
          {TOOLS.length}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {TOOLS.map((tool) => (
          <Card key={tool.to} className={`border-b-4 ${tool.border} h-44`}>
            <button
              type="button"
              onClick={() => navigate(tool.to)}
              className="text-left w-full h-full flex flex-col"
            >
              <div className={`w-9 h-9 shrink-0 rounded-lg bg-gray-50 flex items-center justify-center ${tool.text}`}>
                <tool.icon size={20} />
              </div>
              <p className="mt-3 font-bold text-teal text-sm leading-snug break-words">{tool.name}</p>
              <span className="mt-auto pt-2 inline-block text-mint text-sm font-medium">Open &rarr;</span>
            </button>
          </Card>
        ))}
      </div>
    </Layout>
  )
}
