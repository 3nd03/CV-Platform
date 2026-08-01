import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { getProfile, updateProfile, getAllProfiles, activateProfile, renameProfile } from '../api/profile'

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
  return <div className="border-t border-mint my-8" />
}

function PlaceholderSection({ title, message }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-teal mb-4">{title}</h2>
      <div className="bg-mint-light border border-mint-border rounded-xl p-6 text-body text-sm">
        {message}
      </div>
    </section>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const [fields, setFields] = useState({})
  const [savingProfile, setSavingProfile] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

  const [allProfiles, setAllProfiles] = useState([])
  const [renameDrafts, setRenameDrafts] = useState({})

  useEffect(() => {
    getProfile()
      .then((data) => {
        setFields(data.data)
      })
      .catch((err) => {
        if (err.response?.status === 404) navigate('/onboarding')
      })
    refreshProfiles()
  }, [navigate])

  function refreshProfiles() {
    getAllProfiles()
      .then(setAllProfiles)
      .catch(() => {})
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
      <h1 className="text-2xl font-bold text-teal mb-2">Profile</h1>

      <PlaceholderSection
        title="Account"
        message="Account settings (name, avatar, password) need a backend endpoint that isn't available yet."
      />

      <Divider />

      <section>
        <h2 className="text-lg font-bold text-teal mb-4">Active profile</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {Object.entries(PROFILE_LABELS).map(([key, label]) => (
            <div key={key}>
              <label className="text-xs uppercase tracking-wide text-label">{label}</label>
              <textarea
                rows={2}
                value={fields[key] || ''}
                onChange={(e) => setFields((prev) => ({ ...prev, [key]: e.target.value }))}
                className="mt-1 w-full bg-mint-light border border-mint-border rounded-lg px-4 py-2 text-body focus:outline-none focus:border-mint"
              />
            </div>
          ))}
          {savedMessage && <p className="text-sm text-teal">{savedMessage}</p>}
          <button
            type="submit"
            disabled={savingProfile}
            className="bg-mint text-teal rounded-lg px-6 py-2.5 font-medium disabled:opacity-50"
          >
            {savingProfile ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </section>

      <Divider />

      <section>
        <h2 className="text-lg font-bold text-teal mb-4">Your profiles</h2>
        <div className="space-y-3">
          {allProfiles.map((p) => (
            <div
              key={p.id}
              className="bg-mint-light border border-mint-border rounded-xl p-4 flex items-center justify-between gap-3"
            >
              <div>
                <p className="font-medium text-teal">
                  {p.label || 'Untitled profile'}
                  {p.is_active && <span className="text-label text-xs ml-2">(active)</span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!p.is_active && (
                  <button
                    type="button"
                    onClick={() => handleSwitch(p.id)}
                    className="border border-mint-border text-teal bg-white rounded-lg px-3 py-1.5 text-sm"
                  >
                    Switch
                  </button>
                )}
                <input
                  type="text"
                  placeholder="New name"
                  value={renameDrafts[p.id] ?? ''}
                  onChange={(e) => setRenameDrafts((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  className="bg-white border border-mint-border rounded-lg px-2 py-1.5 text-sm w-32"
                />
                <button
                  type="button"
                  onClick={() => handleRename(p.id)}
                  className="border border-mint-border text-teal bg-white rounded-lg px-3 py-1.5 text-sm"
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
          className="mt-4 border border-mint-border text-teal bg-white rounded-lg px-4 py-2 text-sm"
        >
          + New profile
        </button>
      </section>

      <Divider />

      <PlaceholderSection
        title="History"
        message="Past results per tool need a history endpoint that isn't available yet."
      />
    </Layout>
  )
}
