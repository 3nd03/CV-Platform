import { useState } from 'react'
import Layout from '../components/Layout'
import Card from '../components/Card'
import FollowUpChat from '../components/FollowUpChat'
import { runCareerRoadmap } from '../api/tools'
import { markToolUsed } from '../utils/toolActivity'

function bulletLines(text) {
  return (text || '')
    .split('\n')
    .map((line) => line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean)
}

function StageCard({ label, text, bulleted }) {
  const items = bulleted ? bulletLines(text) : null
  return (
    <div className="border-l-4 border-mint bg-gray-50 rounded-r-lg p-4">
      <p className="text-xs uppercase tracking-wide text-mint font-semibold">{label}</p>
      {bulleted ? (
        <ul className="mt-2 list-disc list-inside space-y-1 text-body text-sm">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-body text-sm whitespace-pre-line">{text}</p>
      )}
    </div>
  )
}

export default function CareerRoadmap() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleRun() {
    setLoading(true)
    try {
      const data = await runCareerRoadmap()
      setResult(data)
      markToolUsed('career_roadmap')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <Card>
        <h1 className="text-xl font-bold text-teal mb-6">Career Roadmap</h1>

        <button
          type="button"
          onClick={handleRun}
          disabled={loading}
          className="w-full bg-mint text-teal rounded-lg py-3 font-medium disabled:opacity-50 transition-colors duration-150"
        >
          {loading ? 'Building...' : 'Build roadmap'}
        </button>

        {result && (
          <>
            <div className="mt-6 space-y-4">
              <StageCard label="Where you are now" text={result.WHERE_NOW} bulleted={false} />
              <StageCard label="3 months" text={result.THREE_MONTH} bulleted />
              <StageCard label="6 months" text={result.SIX_MONTH} bulleted />
              <StageCard label="1 year" text={result.ONE_YEAR} bulleted />
            </div>
            <FollowUpChat toolName="career_roadmap" result={result} />
          </>
        )}
      </Card>
    </Layout>
  )
}
