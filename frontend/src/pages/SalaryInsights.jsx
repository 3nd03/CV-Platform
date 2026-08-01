import { useState } from 'react'
import Layout from '../components/Layout'
import FollowUpChat from '../components/FollowUpChat'
import { runSalaryInsights } from '../api/tools'

function SalaryCard({ level, range }) {
  return (
    <div className="bg-mint-light border border-mint-border rounded-xl p-6">
      <p className="text-xs uppercase tracking-wide text-label">{level}</p>
      <p className="text-xl font-bold text-teal mt-2">{range || 'No data returned.'}</p>
    </div>
  )
}

export default function SalaryInsights() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleRun() {
    setLoading(true)
    try {
      const data = await runSalaryInsights()
      setResult(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-teal mb-6">Salary Insights</h1>

      <button
        type="button"
        onClick={handleRun}
        disabled={loading}
        className="w-full bg-mint text-teal rounded-lg py-3 font-medium disabled:opacity-50"
      >
        {loading ? 'Researching...' : 'Get salary insights'}
      </button>

      {result && (
        <div className="mt-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SalaryCard level="Junior" range={result.RANGE_JUNIOR} />
            <SalaryCard level="Mid" range={result.RANGE_MID} />
            <SalaryCard level="Senior" range={result.RANGE_SENIOR} />
          </div>

          <div className="bg-mint-light border border-mint-border rounded-xl p-6">
            <h3 className="font-bold text-teal mb-2">Factors Affecting Salary</h3>
            <p className="text-body whitespace-pre-line">{result.FACTORS || 'No data returned.'}</p>
          </div>

          <div className="bg-mint-light border border-mint-border rounded-xl p-6">
            <h3 className="font-bold text-teal mb-2">Negotiation Tips</h3>
            <p className="text-body whitespace-pre-line">{result.NEGOTIATION_TIPS || 'No data returned.'}</p>
          </div>

          <FollowUpChat toolName="salary_insights" result={result} />
        </div>
      )}
    </Layout>
  )
}
