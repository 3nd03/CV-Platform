import { useState } from 'react'
import Layout from '../components/Layout'
import FollowUpChat from '../components/FollowUpChat'
import { runJobRoles } from '../api/tools'

function parseNumberedItems(text) {
  if (!text) return []
  const matches = [...text.matchAll(/(?:^|\n)\s*(\d+)\.\s*([\s\S]*?)(?=\n\s*\d+\.\s|$)/g)]
  return matches.map((m) => m[2].trim())
}

function RoleList({ title, items }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-teal mb-4">{title}</h2>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-mint-light border border-mint-border rounded-xl p-4 flex gap-4 items-start"
          >
            <span className="w-7 h-7 shrink-0 rounded-full bg-mint text-teal font-bold flex items-center justify-center text-sm">
              {i + 1}
            </span>
            <p className="text-body whitespace-pre-line">{item}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function JobRoles() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRun() {
    setLoading(true)
    setError('')
    try {
      const data = await runJobRoles()
      setResult(data)
    } catch {
      setError('Could not get role suggestions. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-teal mb-6">Job Role Suggestions</h1>

      <button
        type="button"
        onClick={handleRun}
        disabled={loading}
        className="w-full bg-mint text-teal rounded-lg py-3 font-medium disabled:opacity-50"
      >
        {loading ? 'Matching roles...' : 'Suggest roles'}
      </button>

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

      {result && (
        <div className="mt-8 space-y-8">
          <RoleList title="Target Now" items={parseNumberedItems(result.CURRENT_ROLES)} />
          <RoleList title="Target in Six Months" items={parseNumberedItems(result.FUTURE_ROLES)} />
          <FollowUpChat toolName="job_roles" result={result} />
        </div>
      )}
    </Layout>
  )
}
