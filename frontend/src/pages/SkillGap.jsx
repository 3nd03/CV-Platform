import { useState } from 'react'
import Layout from '../components/Layout'
import SkillGapScore from '../components/SkillGapScore'
import FollowUpChat from '../components/FollowUpChat'
import { runSkillGap } from '../api/tools'

function ResultCard({ title, children }) {
  return (
    <div className="bg-mint-light border border-mint-border rounded-xl p-6">
      <h3 className="font-bold text-teal mb-2">{title}</h3>
      <p className="text-body whitespace-pre-line">{children}</p>
    </div>
  )
}

export default function SkillGap() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRun() {
    setLoading(true)
    setError('')
    try {
      const data = await runSkillGap()
      setResult(data)
      sessionStorage.setItem('skill_gap_done', '1')
    } catch {
      setError('Could not run the analysis. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-teal mb-6">Skill Gap Analysis</h1>

      <button
        type="button"
        onClick={handleRun}
        disabled={loading}
        className="w-full bg-mint text-teal rounded-lg py-3 font-medium disabled:opacity-50"
      >
        {loading ? 'Analysing...' : 'Run analysis'}
      </button>

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

      {result && (
        <div className="mt-8 space-y-4">
          <SkillGapScore score={result.MATCH_SCORE} />
          <ResultCard title="Strong Skills">{result.STRONG_SKILLS || 'No data returned.'}</ResultCard>
          <ResultCard title="Missing Skills">{result.MISSING_SKILLS || 'No data returned.'}</ResultCard>
          <ResultCard title="Next Steps">{result.NEXT_STEPS || 'No data returned.'}</ResultCard>
          <FollowUpChat toolName="skill_gap" result={result} />
        </div>
      )}
    </Layout>
  )
}
