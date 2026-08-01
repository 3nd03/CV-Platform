import { useState } from 'react'
import Layout from '../components/Layout'
import FollowUpChat from '../components/FollowUpChat'
import { runLinkedInMessage } from '../api/tools'

export default function LinkedInMessage() {
  const [context, setContext] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    try {
      const { message_text } = await runLinkedInMessage(context.trim())
      setResult(message_text)
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
      <h1 className="text-2xl font-bold text-teal mb-6">LinkedIn Message Generator</h1>

      <label className="text-xs uppercase tracking-wide text-label">
        Who are you reaching out to? (optional)
      </label>
      <textarea
        rows={5}
        value={context}
        onChange={(e) => setContext(e.target.value)}
        placeholder="e.g. hiring manager at a specific company, alumnus in your target field"
        className="mt-1 w-full bg-mint-light border border-mint-border rounded-lg px-4 py-3 text-body focus:outline-none focus:border-mint"
      />

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-mint text-teal rounded-lg py-3 font-medium mt-4 disabled:opacity-50"
      >
        {loading ? 'Writing...' : 'Generate message'}
      </button>

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
            <h3 className="font-bold text-teal mb-2">Your Message</h3>
            <p className="text-body whitespace-pre-line pr-16">{result}</p>
          </div>
          <FollowUpChat toolName="linkedin_message" result={result} />
        </div>
      )}
    </Layout>
  )
}
