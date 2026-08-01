import { useState } from 'react'
import Layout from '../components/Layout'
import Card from '../components/Card'
import FollowUpChat from '../components/FollowUpChat'
import { runJobRoles } from '../api/tools'
import { markToolUsed } from '../utils/toolActivity'

function parseNumberedItems(text) {
  if (!text) return []
  const matches = [...text.matchAll(/(?:^|\n)\s*(\d+)\.\s*([\s\S]*?)(?=\n\s*\d+\.\s|$)/g)]
  return matches.map((m) => m[2].trim())
}

function RoleList({ title, items }) {
  return (
    <div>
      <h2 className="font-bold text-teal mb-3 text-sm">{title}</h2>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="border-l-4 border-mint bg-gray-50 rounded-r-lg p-3 flex gap-3 items-start">
            <span className="w-6 h-6 shrink-0 rounded-full bg-mint text-teal font-bold flex items-center justify-center text-xs">
              {i + 1}
            </span>
            <p className="text-body text-sm whitespace-pre-line">{item}</p>
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
      markToolUsed('job_roles')
    } catch {
      setError('Could not get role suggestions. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <Card>
        <h1 className="text-xl font-bold text-teal mb-6">Job Role Suggestions</h1>

        <button
          type="button"
          onClick={handleRun}
          disabled={loading}
          className="w-full bg-mint text-teal rounded-lg py-3 font-medium disabled:opacity-50 transition-colors duration-150"
        >
          {loading ? 'Matching roles...' : 'Suggest roles'}
        </button>

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

        {result && (
          <>
            <div className="mt-6 space-y-6">
              <RoleList title="Target Now" items={parseNumberedItems(result.CURRENT_ROLES)} />
              <RoleList title="Target in Six Months" items={parseNumberedItems(result.FUTURE_ROLES)} />
            </div>
            <FollowUpChat toolName="job_roles" result={result} />
          </>
        )}
      </Card>
    </Layout>
  )
}
