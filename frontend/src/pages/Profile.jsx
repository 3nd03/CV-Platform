import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Card from '../components/Card'
import {
  getProfile,
  updateProfile,
  getAllProfiles,
  activateProfile,
  renameProfile,
  getProfileHistory,
} from '../api/profile'

const HISTORY_LABELS = {
  skill_gap: 'Skill Gap Analysis',
  cv_analysis: 'CV Analyser',
  cover_letter: 'Cover Letter',
  job_roles: 'Job Role Suggestions',
  linkedin_message: 'LinkedIn Message',
  interview_prep: 'Interview Prep',
  cv_download: 'CV Download',
  career_roadmap: 'Career Roadmap',
  salary_insights: 'Salary Insights',
}

function formatHistoryContent(content) {
  if (content && typeof content === 'object') {
    return Object.entries(content)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key.replaceAll('_', ' ')}: ${value}`)
      .join('\n')
  }
  return content || ''
}

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

function Divider() {
  return <div className="border-t border-gray-100 my-8" />
}

function PlaceholderNote({ message }) {
  return <div className="bg-gray-50 rounded-lg p-4 text-body text-sm">{message}</div>
}

export default function Profile() {
  const navigate = useNavigate()
  const location = useLocation()
  const fileInputRef = useRef(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  const email = localStorage.getItem('email') || ''
  const displayName = localStorage.getItem('display_name') || email.split('@')[0] || 'Account'
  const initial = (displayName[0] || '?').toUpperCase()

  const [fields, setFields] = useState({})
  const [savingProfile, setSavingProfile] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

  const [allProfiles, setAllProfiles] = useState([])
  const [renameDrafts, setRenameDrafts] = useState({})

  const [history, setHistory] = useState(null)
  const [historyError, setHistoryError] = useState('')
  const [openHistoryTools, setOpenHistoryTools] = useState(() => new Set())

  useEffect(() => {
    getProfile()
      .then((data) => {
        setFields(data.data)
      })
      .catch((err) => {
        if (err.response?.status === 404) navigate('/onboarding')
      })
    refreshProfiles()
    getProfileHistory()
      .then(setHistory)
      .catch(() => setHistoryError('Could not load history.'))
  }, [navigate])

  function toggleHistoryTool(toolKey) {
    setOpenHistoryTools((prev) => {
      const next = new Set(prev)
      if (next.has(toolKey)) {
        next.delete(toolKey)
      } else {
        next.add(toolKey)
      }
      return next
    })
  }

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  useEffect(() => {
    if (!location.hash) return
    const target = document.getElementById(location.hash.slice(1))
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

  function refreshProfiles() {
    getAllProfiles()
      .then(setAllProfiles)
      .catch(() => {})
  }

  function handleAvatarPick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSavingProfile(true)
    setSavedMessage('')
    try {
      const updated = await updateProfile(fields)
      setFields(updated.data)
      setSavedMessage('Profile updated.')
    } catch {
      setSavedMessage('Could not save changes.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleSwitch(profileId) {
    await activateProfile(profileId)
    window.location.reload()
  }

  async function handleRename(profileId) {
    const label = renameDrafts[profileId]
    if (!label?.trim()) return
    await renameProfile(profileId, label.trim())
    refreshProfiles()
  }

  return (
    <Layout>
      <Card>
        <h1 className="text-xl font-bold text-teal mb-6">Profile</h1>

        <section>
          <h2 className="font-bold text-teal mb-4 text-sm uppercase tracking-wide">Account</h2>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 shrink-0 rounded-full border-2 border-mint bg-mint-light flex items-center justify-center text-teal font-bold text-2xl overflow-hidden"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarPick} />
            <div>
              <p className="font-medium text-teal">{displayName}</p>
              <p className="text-sm text-gray-500">{email}</p>
              <p className="text-xs text-gray-500 mt-1">Click the avatar to preview a new photo.</p>
            </div>
          </div>
          <div className="mt-4">
            <PlaceholderNote message="Saving name, avatar, and password needs a backend endpoint that isn't available yet." />
          </div>
        </section>

        <Divider />

        <section id="active-profile">
          <h2 className="font-bold text-teal mb-4 text-sm uppercase tracking-wide">Active Profile</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {Object.entries(PROFILE_LABELS).map(([key, label]) => (
              <div key={key}>
                <label className="text-xs uppercase tracking-wide text-label">{label}</label>
                <textarea
                  rows={2}
                  value={fields[key] || ''}
                  onChange={(e) => setFields((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-body focus:outline-none focus:border-mint transition-colors duration-150"
                />
              </div>
            ))}
            {savedMessage && <p className="text-sm text-teal">{savedMessage}</p>}
            <button
              type="submit"
              disabled={savingProfile}
              className="bg-mint text-teal rounded-lg px-6 py-2.5 font-medium disabled:opacity-50 transition-colors duration-150"
            >
              {savingProfile ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </section>

        <Divider />

        <section id="your-profiles">
          <h2 className="font-bold text-teal mb-4 text-sm uppercase tracking-wide">Your Profiles</h2>
          <div className="space-y-3">
            {allProfiles.map((p) => (
              <div
                key={p.id}
                className="border-l-4 border-mint bg-gray-50 rounded-r-lg p-4 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-medium text-teal text-sm">
                    {p.label || 'Untitled profile'}
                    {p.is_active && <span className="text-label text-xs ml-2">(active)</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!p.is_active && (
                    <button
                      type="button"
                      onClick={() => handleSwitch(p.id)}
                      className="border border-gray-200 text-teal bg-white rounded-lg px-3 py-1.5 text-sm transition-colors duration-150"
                    >
                      Switch
                    </button>
                  )}
                  <input
                    type="text"
                    placeholder="New name"
                    value={renameDrafts[p.id] ?? ''}
                    onChange={(e) => setRenameDrafts((prev) => ({ ...prev, [p.id]: e.target.value }))}
                    className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-32"
                  />
                  <button
                    type="button"
                    onClick={() => handleRename(p.id)}
                    className="border border-gray-200 text-teal bg-white rounded-lg px-3 py-1.5 text-sm transition-colors duration-150"
                  >
                    Rename
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate('/onboarding')}
            className="mt-4 border border-gray-200 text-teal bg-white rounded-lg px-4 py-2 text-sm transition-colors duration-150"
          >
            + New profile
          </button>
        </section>

        <Divider />

        <section id="history">
          <h2 className="font-bold text-teal mb-4 text-sm uppercase tracking-wide">History</h2>
          {historyError && <PlaceholderNote message={historyError} />}
          {!historyError && !history && <p className="text-body text-sm">Loading history...</p>}
          {!historyError && history && (
            <div className="space-y-2">
              {Object.entries(HISTORY_LABELS).map(([toolKey, label]) => {
                const entries = history[toolKey] || []
                const isOpen = openHistoryTools.has(toolKey)
                return (
                  <div key={toolKey} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleHistoryTool(toolKey)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-left transition-colors duration-150"
                    >
                      <span className="font-medium text-teal text-sm">{label}</span>
                      <span className="text-xs text-gray-500">
                        {entries.length} {entries.length === 1 ? 'result' : 'results'} {isOpen ? '▲' : '▼'}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="p-4 space-y-3">
                        {entries.length === 0 ? (
                          <p className="text-body text-sm">No results yet.</p>
                        ) : (
                          entries.map((entry, i) => (
                            <div key={i} className="border-l-4 border-mint bg-gray-50 rounded-r-lg p-3">
                              <p className="text-xs text-gray-500 mb-1">
                                {new Date(entry.created_at).toLocaleString()}
                              </p>
                              <p className="text-body text-sm whitespace-pre-line">
                                {formatHistoryContent(entry.content)}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </Card>
    </Layout>
  )
}
