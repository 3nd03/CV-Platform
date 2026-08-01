import { useState } from 'react'
import Layout from '../components/Layout'
import Card from '../components/Card'
import BackButton from '../components/BackButton'
import SkillGapScore from '../components/SkillGapScore'
import FollowUpChat from '../components/FollowUpChat'
import { runSkillGap } from '../api/tools'
import { markToolUsed } from '../utils/toolActivity'

function ResultCard({ title, children }) {
  return (
    <div className="bg-white border-l-[3px] border-mint rounded-r-lg p-4">
      <h3 className="font-bold text-teal mb-1 text-sm">{title}</h3>
      <p className="text-body text-sm whitespace-pre-line">{children}</p>
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
      markToolUsed('skill_gap')
      const match = /\d+/.exec(data.MATCH_SCORE || '')
      if (match) sessionStorage.setItem('skill_gap_score', `${match[0]}%`)
    } catch {
      setError('Could not run the analysis. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <BackButton />
      <Card>
        <h1 className="text-2xl font-bold text-teal mb-6">Skill Gap Analysis</h1>

        <button
          type="button"
          onClick={handleRun}
          disabled={loading}
          className="w-full h-12 bg-mint text-teal rounded-[10px] font-medium disabled:opacity-50 hover:brightness-90 transition-all duration-200"
        >
          {loading ? 'Analysing...' : 'Run analysis'}
        </button>

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

        {result && (
          <>
            <div className="mt-6 space-y-4">
              <SkillGapScore score={result.MATCH_SCORE} />
              <ResultCard title="Strong Skills">{result.STRONG_SKILLS || 'No data returned.'}</ResultCard>
              <ResultCard title="Missing Skills">{result.MISSING_SKILLS || 'No data returned.'}</ResultCard>
              <ResultCard title="Next Steps">{result.NEXT_STEPS || 'No data returned.'}</ResultCard>
            </div>
            <FollowUpChat toolName="skill_gap" result={result} />
          </>
        )}
      </Card>
    </Layout>
  )
}
