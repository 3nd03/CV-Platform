import { useState } from 'react'
import Layout from '../components/Layout'
import Card from '../components/Card'
import FollowUpChat from '../components/FollowUpChat'
import { runLinkedInMessage } from '../api/tools'
import { markToolUsed } from '../utils/toolActivity'

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
      markToolUsed('linkedin_message')
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
      <Card>
        <h1 className="text-xl font-bold text-teal mb-6">LinkedIn Message Generator</h1>

        <label className="text-xs uppercase tracking-wide text-label">
          Who are you reaching out to? (optional)
        </label>
        <textarea
          rows={5}
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g. hiring manager at a specific company, alumnus in your target field"
          className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-body focus:outline-none focus:border-mint transition-colors duration-150"
        />

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-mint text-teal rounded-lg py-3 font-medium mt-4 disabled:opacity-50 transition-colors duration-150"
        >
          {loading ? 'Writing...' : 'Generate message'}
        </button>

        {result && (
          <>
            <div className="mt-6 border-l-4 border-mint bg-gray-50 rounded-r-lg p-4 relative">
              <button
                type="button"
                onClick={handleCopy}
                className="absolute top-4 right-4 border border-gray-200 text-teal bg-white rounded-lg px-3 py-1 text-sm transition-colors duration-150"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
              <h3 className="font-bold text-teal mb-1 text-sm">Your Message</h3>
              <p className="text-body text-sm whitespace-pre-line pr-16">{result}</p>
            </div>
            <FollowUpChat toolName="linkedin_message" result={result} />
          </>
        )}
      </Card>
    </Layout>
  )
}
