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

export default function Onboarding() {
  const navigate = useNavigate()
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

  const progressPct = ((step + 1) / QUESTIONS.length) * 100

  return (
    <div className="min-h-screen bg-white px-4 py-10">
      <div className="max-w-[720px] mx-auto">
        <div className="w-full h-2 bg-mint-border rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-mint transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="bg-white border border-mint-border border-l-4 border-l-mint rounded-xl p-6">
          <p className="text-xs uppercase tracking-wide text-mint font-semibold text-right">
            Question {step + 1} of {QUESTIONS.length}
          </p>
          <h2 className="text-lg font-bold text-teal mt-2">{question}</h2>

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

          <textarea
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            rows={5}
            className="mt-4 w-full bg-gray-50 border border-mint-border rounded-lg px-4 py-3 text-body focus:outline-none focus:border-mint"
            disabled={submitting}
          />

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleNext}
              disabled={submitting}
              className="flex-1 bg-mint text-teal rounded-lg py-2.5 font-medium disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Next'}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              disabled={submitting}
              className="flex-1 border border-mint-border text-teal bg-white rounded-lg py-2.5 font-medium disabled:opacity-50"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
