import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Target, BarChart2, CheckSquare, UserCheck } from 'lucide-react'
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

function MetricCard({ icon: Icon, label, value, subtext }) {
  return (
    <Card>
      <div className="w-10 h-10 rounded-full bg-mint-light flex items-center justify-center text-teal">
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-teal mt-3">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
      {subtext && <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>}
    </Card>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
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

  useEffect(() => {
    if (!location.hash) return
    const target = document.getElementById(location.hash.slice(1))
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

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

  const toolsUsed = getToolsUsedCount()

  return (
    <Layout>
      <h1 className="text-2xl font-bold" style={{ color: '#1a3a3a' }}>
        {greetingForNow()}{greetingName ? `, ${greetingName}` : ''}
      </h1>
      <p className="text-gray-500 mt-1 text-sm">Here's your career overview</p>

      {profileIncomplete && (
        <div className="mt-6 bg-mint-light border border-mint rounded-2xl p-4 flex items-center gap-4">
          <span className="w-10 h-10 shrink-0 rounded-full bg-mint flex items-center justify-center text-teal text-lg">
            !
          </span>
          <p className="flex-1 text-body text-sm">
            Your profile is {profilePct}% complete. Fill in the rest to get sharper results from every tool.
          </p>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="shrink-0 bg-mint text-teal rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200"
          >
            Complete profile
          </button>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={BarChart2}
          label="Skill Gap Score"
          value={skillGapScore || 'N/A'}
          subtext={skillGapScore ? 'From your last analysis' : 'Not run yet'}
        />
        <MetricCard
          icon={Target}
          label="Target Role"
          value={data.target_role || 'Not set'}
          subtext={data.target_role ? 'Current focus' : 'Set this in onboarding'}
        />
        <MetricCard icon={CheckSquare} label="Tools Used" value={`${toolsUsed} / ${TOOLS.length}`} subtext="This session" />
        <MetricCard
          icon={UserCheck}
          label="Profile Complete"
          value={`${profilePct}%`}
          subtext={`${filledCount} of ${PROFILE_FIELD_KEYS.length} fields`}
        />
      </div>

      <div id="tools-section" className="mt-10 flex items-center gap-2 scroll-mt-6">
        <h2 className="text-lg font-bold text-teal">Your tools</h2>
        <span className="bg-mint-light text-teal text-xs font-semibold px-2 py-0.5 rounded-full">
          {TOOLS.length}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {TOOLS.map((tool) => (
          <Card key={tool.to} hoverable className="h-40">
            <button
              type="button"
              onClick={() => navigate(tool.to)}
              className="text-left w-full h-full flex flex-col"
            >
              <div className={`w-10 h-10 shrink-0 rounded-full bg-mint-light flex items-center justify-center ${tool.text}`}>
                <tool.icon size={20} />
              </div>
              <p className="mt-3 font-bold text-teal text-sm leading-snug break-words">{tool.name}</p>
              <p className="mt-1 text-xs text-gray-500 leading-snug line-clamp-2">{tool.description}</p>
            </button>
          </Card>
        ))}
      </div>
    </Layout>
  )
}
