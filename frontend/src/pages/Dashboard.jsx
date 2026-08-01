import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ProfileSummary from '../components/ProfileSummary'
import ToolCard from '../components/ToolCard'
import { getProfile } from '../api/profile'

const TOOLS = [
  { to: '/skill-gap', icon: '%', name: 'Skill Gap Analysis', description: 'See how you match your target role.' },
  { to: '/cv-analyser', icon: '\u{1F4C4}', name: 'CV Analyser', description: 'Upload your CV for a structured review.' },
  { to: '/cover-letter', icon: '✉', name: 'Cover Letter', description: 'Generate a tailored cover letter.' },
  { to: '/job-roles', icon: '★', name: 'Job Role Suggestions', description: 'Roles to target now and in six months.' },
  { to: '/linkedin-message', icon: 'in', name: 'LinkedIn Message', description: 'Draft a cold outreach message.' },
  { to: '/interview-prep', icon: '?', name: 'Interview Prep', description: 'Practice role-specific questions.' },
  { to: '/cv-download', icon: '↓', name: 'CV Download', description: 'Get an ATS-friendly CV as a PDF.' },
  { to: '/career-roadmap', icon: '→', name: 'Career Roadmap', description: 'Milestones from now to one year out.' },
  { to: '/salary-insights', icon: '£', name: 'Salary Insights', description: 'Ranges and negotiation tips.' },
  { to: '/application-tracker', icon: '✓', name: 'Application Tracker', description: 'Track every application in one place.' },
  { to: '/cv-translator', icon: '\u{1F310}', name: 'CV Translator', description: 'Translate your CV into another language.' },
]

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

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-teal">
        Welcome back{greetingName ? `, ${greetingName}` : ''}
      </h1>

      {profile && (
        <div className="mt-6">
          <ProfileSummary profile={profile.data} />
        </div>
      )}

      <div className="mt-8 bg-mint-light border border-mint-border rounded-xl p-6 text-center">
        <p className="text-body text-sm">Run the Skill Gap Analysis to see your match score here.</p>
      </div>

      <h2 className="text-lg font-bold text-teal mt-10 mb-4">Tools</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {TOOLS.map((tool) => (
          <ToolCard key={tool.to} {...tool} />
        ))}
      </div>
    </Layout>
  )
}
