import { useState } from 'react'
import Layout from '../components/Layout'
import FollowUpChat from '../components/FollowUpChat'
import { runInterviewPrep } from '../api/tools'

function parseQuestions(text) {
  if (!text) return []
  const blocks = [...text.matchAll(/(?:^|\n)\s*\d+\.\s*([\s\S]*?)(?=\n\s*\d+\.\s|$)/g)].map((m) => m[1].trim())
  return blocks.map((block) => {
    const markerIndex = block.search(/Strong answer covers:/i)
    if (markerIndex === -1) {
      return { question: block, guidance: '' }
    }
    return {
      question: block.slice(0, markerIndex).trim(),
      guidance: block.slice(markerIndex).replace(/Strong answer covers:/i, '').trim(),
    }
  })
}

export default function InterviewPrep() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const skillGapDone = sessionStorage.getItem('skill_gap_done') === '1'

  async function handleGenerate() {
    setLoading(true)
    try {
      const { result: text } = await runInterviewPrep()
      setResult(text)
    } finally {
      setLoading(false)
    }
  }

  const questions = result ? parseQuestions(result) : []

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-teal mb-6">Interview Prep</h1>

      {!skillGapDone && (
        <div className="bg-mint-light border border-mint-border rounded-xl p-4 mb-4 text-body text-sm">
          Tip: run the Skill Gap Analysis first for questions targeted at your weaker areas.
        </div>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-mint text-teal rounded-lg py-3 font-medium disabled:opacity-50"
      >
        {loading ? 'Preparing...' : 'Generate questions'}
      </button>

      {questions.length > 0 && (
        <div className="mt-8 space-y-4">
          {questions.map((q, i) => (
            <div
              key={i}
              className="bg-mint-light border border-mint-border rounded-xl p-4 flex gap-4 items-start"
            >
              <span className="w-7 h-7 shrink-0 rounded-full bg-mint text-teal font-bold flex items-center justify-center text-sm">
                {i + 1}
              </span>
              <div>
                <p className="font-bold text-teal">{q.question}</p>
                {q.guidance && <p className="text-body text-sm mt-1">{q.guidance}</p>}
              </div>
            </div>
          ))}
          <FollowUpChat toolName="interview_prep" result={result} />
        </div>
      )}
    </Layout>
  )
}
