import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Target, BarChart2, CheckSquare, UserCheck, Sparkles, PartyPopper, ArrowRight } from 'lucide-react'
import Layout from '../components/Layout'
import Card from '../components/Card'
import Logo from '../components/Logo'
import { getProfile, getToolsUsed, getLatestSkillGap } from '../api/profile'
import { TOOLS, TOOL_CATEGORIES } from '../config/tools'
import { isToolUsed } from '../utils/toolActivity'

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

function getRecommendation({ profileIncomplete, profilePct, skillGapScore }) {
  if (profileIncomplete) {
    return {
      icon: UserCheck,
      title: 'Finish setting up your profile',
      body: `Your profile is ${profilePct}% complete. Fill in the rest to get sharper results from every tool.`,
      cta: 'Complete profile',
      to: '/profile',
    }
  }
  if (!skillGapScore) {
    return {
      icon: BarChart2,
      title: 'Run your Skill Gap Analysis',
      body: 'See exactly how you match your target role and where to focus next.',
      cta: 'Run analysis',
      to: '/skill-gap',
    }
  }
  const unusedTool = TOOLS.find((tool) => !isToolUsed(tool.doneKey))
  if (unusedTool) {
    return {
      icon: Sparkles,
      title: `Try ${unusedTool.name}`,
      body: unusedTool.description,
      cta: 'Open tool',
      to: unusedTool.to,
    }
  }
  return {
    icon: PartyPopper,
    title: "You've used every tool",
    body: 'Nice work. Come back after your next update to keep your results fresh.',
    cta: null,
    to: null,
  }
}

function SectionHeading({ children, badge }) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-lg font-bold text-teal">{children}</h2>
      {badge != null && (
        <span className="bg-mint-light text-teal text-xs font-semibold px-2 py-0.5 rounded-full">{badge}</span>
      )}
    </div>
  )
}

function Divider() {
  return <div className="border-t border-gray-100 my-8" />
}

function MetricCard({ icon: Icon, label, value, subtext, className = '', highlight = false }) {
  return (
    <Card className={`!p-5 ${highlight ? '!bg-mint-light !border-mint' : ''} ${className}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={16} className="text-teal shrink-0" />
          <span className="font-bold text-teal text-sm truncate">{label}</span>
        </div>
        {subtext && <span className="text-xs text-gray-500 shrink-0">{subtext}</span>}
      </div>
      <p className={`font-bold text-teal mt-2 text-left truncate ${highlight ? 'text-3xl' : 'text-2xl'}`}>{value}</p>
    </Card>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(TOOL_CATEGORIES[0])
  const [toolsUsed, setToolsUsed] = useState({ count: 0, total: 0 })
  const [skillGap, setSkillGap] = useState(null)

  useEffect(() => {
    getProfile()
      .then((data) => setProfile(data))
      .catch((err) => {
        if (err.response?.status === 404) {
          navigate('/onboarding')
        }
      })
      .finally(() => setLoading(false))
    getToolsUsed()
      .then(setToolsUsed)
      .catch(() => {})
    getLatestSkillGap()
      .then(setSkillGap)
      .catch(() => {})
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

  const skillGapScore = skillGap?.result?.MATCH_SCORE || null

  const recommendation = getRecommendation({ profileIncomplete, profilePct, skillGapScore })
  const RecommendationIcon = recommendation.icon

  return (
    <Layout>
      <Logo className="mb-6" />
      <h1 className="text-2xl font-bold" style={{ color: '#1a3a3a' }}>
        {greetingForNow()}{greetingName ? `, ${greetingName}` : ''}
      </h1>
      <p className="text-gray-500 mt-1 text-sm">Here's your career overview</p>

      <Divider />

      <section>
        <SectionHeading>Recommended next step</SectionHeading>
        <div className="mt-4 bg-mint-light border border-mint rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <span className="w-11 h-11 shrink-0 rounded-full bg-mint flex items-center justify-center text-teal">
              <RecommendationIcon size={20} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-teal text-sm">{recommendation.title}</p>
              <p className="text-body text-sm mt-0.5">{recommendation.body}</p>
            </div>
          </div>
          {recommendation.cta && (
            <button
              type="button"
              onClick={() => navigate(recommendation.to)}
              className="shrink-0 w-full sm:w-auto flex items-center justify-center gap-1 bg-mint text-teal rounded-[10px] px-4 h-10 text-sm font-medium hover:brightness-90 transition-all duration-200"
            >
              {recommendation.cta}
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </section>

      <Divider />

      <section>
        <SectionHeading>Your progress</SectionHeading>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <MetricCard
            highlight
            className="col-span-2"
            icon={Target}
            label="Target role"
            value={data.target_role || 'Not set'}
            subtext={data.target_role ? 'Current focus' : 'Set this in onboarding'}
          />
          <MetricCard
            className="col-span-2"
            icon={BarChart2}
            label="Skill Gap Score"
            value={skillGapScore || 'N/A'}
            subtext={
              skillGapScore && skillGap?.created_at
                ? `As of ${new Date(skillGap.created_at).toLocaleDateString()}`
                : 'Not run yet'
            }
          />
          <MetricCard
            className="col-span-1"
            icon={CheckSquare}
            label="Tools Used"
            value={`${toolsUsed.count} / ${toolsUsed.total}`}
            subtext="All time"
          />
          <MetricCard
            className="col-span-1"
            icon={UserCheck}
            label="Profile Complete"
            value={`${profilePct}%`}
            subtext={`${filledCount} of ${PROFILE_FIELD_KEYS.length} fields`}
          />
        </div>
      </section>

      <Divider />

      <section id="tools-section" className="scroll-mt-6">
        <SectionHeading badge={TOOLS.length}>Your tools</SectionHeading>

        <div className="mt-4 flex flex-wrap gap-2">
          {TOOL_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-[10px] text-sm font-medium transition-colors duration-200 ${
                activeCategory === category
                  ? 'bg-mint text-teal'
                  : 'bg-white border border-card-border text-gray-500 hover:bg-mint-light'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {TOOLS.filter((tool) => tool.category === activeCategory).map((tool) => (
            <Card key={tool.to} hoverable className="h-40">
              <button
                type="button"
                onClick={() => navigate(tool.to)}
                className="text-left w-full h-full flex flex-col"
              >
                <div
                  className={`w-10 h-10 shrink-0 rounded-full bg-mint-light flex items-center justify-center ${tool.text}`}
                >
                  <tool.icon size={20} />
                </div>
                <p className="mt-3 font-bold text-teal text-sm leading-snug break-words">{tool.name}</p>
                <p className="mt-1 text-xs text-gray-500 leading-snug line-clamp-2">{tool.description}</p>
              </button>
            </Card>
          ))}
        </div>
      </section>
    </Layout>
  )
}
