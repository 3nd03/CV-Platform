import { useState } from 'react'
import Layout from '../components/Layout'
import Card from '../components/Card'
import { runCvDownload, downloadBlob } from '../api/tools'
import { markToolUsed } from '../utils/toolActivity'

export default function CvDownload() {
  const [cvText, setCvText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleGenerate() {
    if (!cvText.trim()) {
      setError('Paste your CV text above before generating.')
      return
    }
    setLoading(true)
    setError('')
    setDone(false)
    try {
      const blob = await runCvDownload(cvText.trim())
      downloadBlob(blob, 'cv.pdf')
      setDone(true)
      markToolUsed('cv_download')
    } catch {
      setError('Could not generate the PDF. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <Card>
        <h1 className="text-xl font-bold text-teal mb-6">CV Download</h1>

        <label className="block border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl p-6 text-center mb-4 opacity-60 cursor-not-allowed">
          <span className="text-body text-sm">
            PDF upload isn't available yet for this tool &mdash; paste your CV text below instead.
          </span>
        </label>

        <label className="text-xs uppercase tracking-wide text-label">CV text</label>
        <textarea
          rows={12}
          value={cvText}
          onChange={(e) => setCvText(e.target.value)}
          className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-body focus:outline-none focus:border-mint transition-colors duration-150"
        />

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-mint text-teal rounded-lg py-3 font-medium mt-4 disabled:opacity-50 transition-colors duration-150"
        >
          {loading ? 'Generating...' : 'Generate and download'}
        </button>

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
        {done && <p className="text-sm text-teal mt-4">Your CV has been downloaded.</p>}
      </Card>
    </Layout>
  )
}
