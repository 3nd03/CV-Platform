import { useState } from 'react'
import Layout from '../components/Layout'
import Card from '../components/Card'
import BackButton from '../components/BackButton'
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
      <BackButton />
      <Card>
        <h1 className="text-2xl font-bold text-teal mb-6">CV Download</h1>

        <label className="block border-2 border-dashed border-card-border bg-gray-50 rounded-xl p-6 text-center mb-4 opacity-60 cursor-not-allowed">
          <span className="text-body text-sm">
            PDF upload isn't available yet for this tool &mdash; paste your CV text below instead.
          </span>
        </label>

        <label className="text-[11px] uppercase tracking-wide text-label">CV text</label>
        <textarea
          rows={12}
          value={cvText}
          onChange={(e) => setCvText(e.target.value)}
          className="mt-1 w-full bg-white border border-card-border rounded-[10px] px-4 py-3 text-sm text-body focus:outline-none focus:border-mint transition-colors duration-200"
        />

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full h-12 bg-mint text-teal rounded-[10px] font-medium mt-4 disabled:opacity-50 hover:brightness-90 transition-all duration-200"
        >
          {loading ? 'Generating...' : 'Generate and download'}
        </button>

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
        {done && <p className="text-sm text-teal mt-4">Your CV has been downloaded.</p>}
      </Card>
    </Layout>
  )
}
