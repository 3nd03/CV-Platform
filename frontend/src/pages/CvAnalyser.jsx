import { useState } from 'react'
import Layout from '../components/Layout'
import Card from '../components/Card'
import BackButton from '../components/BackButton'
import FollowUpChat from '../components/FollowUpChat'
import { runCvAnalyse } from '../api/tools'
import { markToolUsed } from '../utils/toolActivity'

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
      markToolUsed('cv_analyser')
    } catch {
      setError('Could not analyse the CV. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const sections = result ? parseSections(result) : null

  return (
    <Layout>
      <BackButton />
      <Card>
        <h1 className="text-2xl font-bold text-teal mb-6">CV Analyser</h1>

        <label className="block border-2 border-dashed border-mint-border bg-mint-light rounded-xl p-8 text-center cursor-pointer">
          <span className="text-3xl block mb-2">&#8593;</span>
          <span className="text-body text-sm">{file ? file.name : 'Upload your CV (PDF)'}</span>
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
          className="w-full h-12 bg-mint text-teal rounded-[10px] font-medium mt-4 disabled:opacity-50 hover:brightness-90 transition-all duration-200"
        >
          {loading ? 'Analysing...' : 'Analyse CV'}
        </button>

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

        {sections && (
          <>
            <div className="mt-6 space-y-4">
              {SECTIONS.map((title) => (
                <div key={title} className="bg-white border-l-[3px] border-mint rounded-r-lg p-4">
                  <h3 className="font-bold text-teal mb-1 text-sm">{title}</h3>
                  <p className="text-body text-sm whitespace-pre-line">{sections[title] || 'No data returned.'}</p>
                </div>
              ))}
            </div>
            <FollowUpChat toolName="cv_analyser" result={result} />
          </>
        )}
      </Card>
    </Layout>
  )
}
