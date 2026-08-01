import { useState } from 'react'
import Layout from '../components/Layout'
import FollowUpChat from '../components/FollowUpChat'
import { runCoverLetter } from '../api/tools'

export default function CoverLetter() {
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    if (!jobDescription.trim()) {
      setError('Paste a job description above before generating.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { letter_text } = await runCoverLetter(jobDescription.trim())
      setResult(letter_text)
    } catch {
      setError('Could not generate the cover letter. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-teal mb-6">Cover Letter Generator</h1>

      <label className="text-xs uppercase tracking-wide text-label">Job description</label>
      <textarea
        rows={8}
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        className="mt-1 w-full bg-mint-light border border-mint-border rounded-lg px-4 py-3 text-body focus:outline-none focus:border-mint"
      />

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-mint text-teal rounded-lg py-3 font-medium mt-4 disabled:opacity-50"
      >
        {loading ? 'Writing...' : 'Generate cover letter'}
      </button>

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

      {result && (
        <div className="mt-8">
          <div className="bg-mint-light border border-mint-border rounded-xl p-6 relative">
            <button
              type="button"
              onClick={handleCopy}
              className="absolute top-4 right-4 border border-mint-border text-teal bg-white rounded-lg px-3 py-1 text-sm"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
            <h3 className="font-bold text-teal mb-2">Your Cover Letter</h3>
            <p className="text-body whitespace-pre-line pr-16">{result}</p>
          </div>
          <FollowUpChat toolName="cover_letter" result={result} />
        </div>
      )}
    </Layout>
  )
}
