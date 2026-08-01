import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Card from '../components/Card'
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
  return <div className="border-t border-gray-100 my-8" />
}

function PlaceholderNote({ message }) {
  return <div className="bg-gray-50 rounded-lg p-4 text-body text-sm">{message}</div>
}

export default function Profile() {
  const navigate = useNavigate()
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

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

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

        <section>
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

        <section>
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

        <section>
          <h2 className="font-bold text-teal mb-4 text-sm uppercase tracking-wide">History</h2>
          <PlaceholderNote message="Past results per tool need a history endpoint that isn't available yet." />
        </section>
      </Card>
    </Layout>
  )
}
