import { useState } from 'react'
import Layout from '../components/Layout'
import { runCvTranslate, downloadBlob } from '../api/tools'

const LANGUAGES = ['Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Mandarin', 'Arabic']

export default function CvTranslator() {
  const [cvText, setCvText] = useState('')
  const [language, setLanguage] = useState(LANGUAGES[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleTranslate() {
    if (!cvText.trim()) {
      setError('Paste your CV text above before translating.')
      return
    }
    setLoading(true)
    setError('')
    setDone(false)
    try {
      const blob = await runCvTranslate(cvText.trim(), language)
      downloadBlob(blob, 'cv_translated.pdf')
      setDone(true)
    } catch {
      setError('Could not translate the CV. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-teal mb-6">CV Language Translator</h1>

      <label className="text-xs uppercase tracking-wide text-label">CV text</label>
      <textarea
        rows={12}
        value={cvText}
        onChange={(e) => setCvText(e.target.value)}
        className="mt-1 w-full bg-mint-light border border-mint-border rounded-lg px-4 py-3 text-body focus:outline-none focus:border-mint"
      />

      <label className="text-xs uppercase tracking-wide text-label mt-4 block">Translate to</label>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="mt-1 w-full bg-mint-light border border-mint-border rounded-lg px-4 py-2 text-body focus:outline-none focus:border-mint"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleTranslate}
        disabled={loading}
        className="w-full bg-mint text-teal rounded-lg py-3 font-medium mt-4 disabled:opacity-50"
      >
        {loading ? 'Translating...' : 'Translate and download'}
      </button>

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
      {done && <p className="text-sm text-teal mt-4">Your translated CV has been downloaded.</p>}
    </Layout>
  )
}
