import { useState } from 'react'
import Layout from '../components/Layout'
import Card from '../components/Card'
import FollowUpChat from '../components/FollowUpChat'
import { runSalaryInsights } from '../api/tools'
import { markToolUsed } from '../utils/toolActivity'

function SalaryCard({ level, range }) {
  return (
    <div className="border-l-4 border-mint bg-gray-50 rounded-r-lg p-4">
      <p className="text-xs uppercase tracking-wide text-label">{level}</p>
      <p className="text-lg font-bold text-teal mt-1">{range || 'No data returned.'}</p>
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
      markToolUsed('salary_insights')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <Card>
        <h1 className="text-xl font-bold text-teal mb-6">Salary Insights</h1>

        <button
          type="button"
          onClick={handleRun}
          disabled={loading}
          className="w-full bg-mint text-teal rounded-lg py-3 font-medium disabled:opacity-50 transition-colors duration-150"
        >
          {loading ? 'Researching...' : 'Get salary insights'}
        </button>

        {result && (
          <>
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <SalaryCard level="Junior" range={result.RANGE_JUNIOR} />
                <SalaryCard level="Mid" range={result.RANGE_MID} />
                <SalaryCard level="Senior" range={result.RANGE_SENIOR} />
              </div>

              <div className="border-l-4 border-mint bg-gray-50 rounded-r-lg p-4">
                <h3 className="font-bold text-teal mb-1 text-sm">Factors Affecting Salary</h3>
                <p className="text-body text-sm whitespace-pre-line">{result.FACTORS || 'No data returned.'}</p>
              </div>

              <div className="border-l-4 border-mint bg-gray-50 rounded-r-lg p-4">
                <h3 className="font-bold text-teal mb-1 text-sm">Negotiation Tips</h3>
                <p className="text-body text-sm whitespace-pre-line">
                  {result.NEGOTIATION_TIPS || 'No data returned.'}
                </p>
              </div>
            </div>
            <FollowUpChat toolName="salary_insights" result={result} />
          </>
        )}
      </Card>
    </Layout>
  )
}
