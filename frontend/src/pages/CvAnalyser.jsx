import { useState } from 'react'
import Layout from '../components/Layout'
import FollowUpChat from '../components/FollowUpChat'
import { runCvAnalyse } from '../api/tools'

const SECTIONS = ['Overall Impression', 'What Works Well', 'Weaknesses and Gaps', 'Specific Improvements']

function parseSections(text) {
  const sections = {}
  SECTIONS.forEach((title, i) => {
    const marker = `**${title}**`
    const start = text.indexOf(marker)
    if (start === -1) {
      sections[title] = ''
      return
    }
    const contentStart = start + marker.length
    let end = text.length
    for (let j = i + 1; j < SECTIONS.length; j++) {
      const pos = text.indexOf(`**${SECTIONS[j]}**`)
      if (pos !== -1 && pos < end) end = pos
    }
    sections[title] = text.slice(contentStart, end).trim()
  })
  return sections
}

export default function CvAnalyser() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAnalyse() {
    if (!file) {
      setError('Upload a CV above before running the analysis.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { result: text } = await runCvAnalyse(file)
      setResult(text)
    } catch {
      setError('Could not analyse the CV. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const sections = result ? parseSections(result) : null

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-teal mb-6">CV Analyser</h1>

      <label className="block border-2 border-dashed border-mint-border bg-mint-light rounded-xl p-8 text-center cursor-pointer">
        <span className="text-3xl block mb-2">&#8593;</span>
        <span className="text-body text-sm">
          {file ? file.name : 'Upload your CV (PDF)'}
        </span>
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </label>

      <button
        type="button"
        onClick={handleAnalyse}
        disabled={loading}
        className="w-full bg-mint text-teal rounded-lg py-3 font-medium mt-4 disabled:opacity-50"
      >
        {loading ? 'Analysing...' : 'Analyse CV'}
      </button>

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

      {sections && (
        <div className="mt-8 space-y-4">
          {SECTIONS.map((title) => (
            <div key={title} className="bg-mint-light border border-mint-border rounded-xl p-6">
              <h3 className="font-bold text-teal mb-2">{title}</h3>
              <p className="text-body whitespace-pre-line">{sections[title] || 'No data returned.'}</p>
            </div>
          ))}
          <FollowUpChat toolName="cv_analyser" result={result} />
        </div>
      )}
    </Layout>
  )
}
