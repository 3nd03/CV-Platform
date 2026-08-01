import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getApplications, addApplication, updateApplicationStatus } from '../api/tools'

const STATUS_OPTIONS = ['Applied', 'Interview', 'Offer', 'Rejected']

export default function ApplicationTracker() {
  const [applications, setApplications] = useState([])
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [dateApplied, setDateApplied] = useState('')
  const [status, setStatus] = useState('Applied')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    refresh()
  }, [])

  function refresh() {
    getApplications()
      .then(setApplications)
      .catch(() => {})
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!company.trim() || !role.trim() || !dateApplied) {
      setError('Fill in company, role, and date before adding.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await addApplication({ company: company.trim(), role: role.trim(), date_applied: dateApplied, status })
      setCompany('')
      setRole('')
      setDateApplied('')
      setStatus('Applied')
      refresh()
    } catch {
      setError('Could not add the application.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStatusChange(applicationId, newStatus) {
    setApplications((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status: newStatus } : a)))
    try {
      await updateApplicationStatus(applicationId, newStatus)
    } catch {
      refresh()
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-teal mb-6">Application Tracker</h1>

      <form onSubmit={handleAdd} className="bg-mint-light border border-mint-border rounded-xl p-6 space-y-4">
        <h2 className="font-bold text-teal">Add an application</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-label">Company</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="mt-1 w-full bg-white border border-mint-border rounded-lg px-4 py-2 text-body focus:outline-none focus:border-mint"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-label">Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full bg-white border border-mint-border rounded-lg px-4 py-2 text-body focus:outline-none focus:border-mint"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-label">Date applied</label>
            <input
              type="date"
              value={dateApplied}
              onChange={(e) => setDateApplied(e.target.value)}
              className="mt-1 w-full bg-white border border-mint-border rounded-lg px-4 py-2 text-body focus:outline-none focus:border-mint"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-label">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full bg-white border border-mint-border rounded-lg px-4 py-2 text-body focus:outline-none focus:border-mint"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="bg-mint text-teal rounded-lg px-6 py-2.5 font-medium disabled:opacity-50"
        >
          {submitting ? 'Adding...' : 'Add application'}
        </button>
      </form>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-label border-b border-mint-border">
              <th className="py-2 pr-4">Company</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">Date applied</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-b border-mint-border">
                <td className="py-3 pr-4 text-body">{app.company}</td>
                <td className="py-3 pr-4 text-body">{app.role}</td>
                <td className="py-3 pr-4 text-body">{app.date_applied}</td>
                <td className="py-3">
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className="bg-mint-light border border-mint-border rounded-lg px-3 py-1.5 text-body focus:outline-none focus:border-mint"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 && (
          <p className="text-body text-sm mt-4">No applications tracked yet. Add one above.</p>
        )}
      </div>
    </Layout>
  )
}
