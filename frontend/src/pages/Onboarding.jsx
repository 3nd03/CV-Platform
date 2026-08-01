import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProfile } from '../api/profile'

const QUESTIONS = [
  ['target_role', 'What role are you targeting?'],
  ['current_skills', 'What are your main technical and professional skills?'],
  ['background', 'What is your educational or professional background?'],
  ['experience', 'How many years of relevant experience do you have?'],
  ['tools', 'What tools, languages, or platforms do you use regularly?'],
  ['location', 'Where are you based, and are you open to relocation or remote work?'],
  ['salary', 'What is your target salary range?'],
  ['open_to_learning', 'Are there areas you are actively trying to develop or learn?'],
  ['timeline', 'What is your job search timeline?'],
  ['self_gaps', 'What do you feel are your biggest gaps for the role you are targeting?'],
  ['access_needs', 'Do you have any disabilities or access needs we should be aware of?'],
]

function ProgressBar({ pct }) {
  return (
    <div className="w-full h-2 bg-mint-border rounded-full overflow-hidden mb-8">
      <div className="h-full bg-mint transition-all duration-150" style={{ width: `${pct}%` }} />
    </div>
  )
}

function QuestionCard({ children }) {
  return (
    <div className="bg-white shadow-card border-l-4 border-mint rounded-xl p-6">{children}</div>
  )
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [stage, setStage] = useState('upload')
  const [cvFile, setCvFile] = useState(null)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [key, question] = QUESTIONS[step]

  async function finish(finalAnswers) {
    setSubmitting(true)
    try {
      await createProfile(finalAnswers)
      navigate('/dashboard')
    } catch {
      setError('Could not save your profile. Try again.')
      setSubmitting(false)
    }
  }

  function handleNext() {
    if (!current.trim()) {
      setError('Please enter an answer before continuing.')
      return
    }
    setError('')
    advance(current.trim())
  }

  function handleSkip() {
    setError('')
    advance('')
  }

  function advance(value) {
    const updated = { ...answers, [key]: value }
    setAnswers(updated)
    setCurrent('')
    if (step + 1 >= QUESTIONS.length) {
      finish(updated)
    } else {
      setStep(step + 1)
    }
  }

  function handleTextareaKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleNext()
    }
  }

  if (stage === 'upload') {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="max-w-[720px] mx-auto">
          <QuestionCard>
            <p className="text-xs uppercase tracking-wide text-mint font-semibold">Speed things up</p>
            <h2 className="text-lg font-bold text-teal mt-2">Upload your CV</h2>
            <p className="text-body text-sm mt-1">
              Automatic pre-fill from your CV isn't available yet, but you can still upload it here to keep on
              file. You'll answer the questions below either way.
            </p>

            <label className="mt-4 block border-2 border-dashed border-mint-border bg-mint-light rounded-xl p-8 text-center cursor-pointer">
              <span className="text-3xl block mb-2">&#8593;</span>
              <span className="text-body text-sm">{cvFile ? cvFile.name : 'Upload your CV (PDF)'}</span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
              />
            </label>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setStage('questions')}
                className="flex-1 bg-mint text-teal rounded-lg py-2.5 font-medium transition-colors duration-150"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={() => setStage('questions')}
                className="flex-1 border border-mint-border text-teal bg-white rounded-lg py-2.5 font-medium transition-colors duration-150"
              >
                Skip
              </button>
            </div>
          </QuestionCard>
        </div>
      </div>
    )
  }

  const progressPct = ((step + 1) / QUESTIONS.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-[720px] mx-auto">
        <ProgressBar pct={progressPct} />

        <QuestionCard>
          <p className="text-xs uppercase tracking-wide text-mint font-semibold text-right">
            Question {step + 1} of {QUESTIONS.length}
          </p>
          <h2 className="text-lg font-bold text-teal mt-2">{question}</h2>

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

          <textarea
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            rows={5}
            className="mt-4 w-full bg-gray-50 border border-mint-border rounded-lg px-4 py-3 text-body focus:outline-none focus:border-mint"
            disabled={submitting}
          />
          <p className="text-xs text-gray-500 mt-1">Press Enter to continue, Shift+Enter for a new line.</p>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleNext}
              disabled={submitting}
              className="flex-1 bg-mint text-teal rounded-lg py-2.5 font-medium disabled:opacity-50 transition-colors duration-150"
            >
              {submitting ? 'Saving...' : 'Next'}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              disabled={submitting}
              className="flex-1 border border-mint-border text-teal bg-white rounded-lg py-2.5 font-medium disabled:opacity-50 transition-colors duration-150"
            >
              Skip
            </button>
          </div>
        </QuestionCard>
      </div>
    </div>
  )
}
