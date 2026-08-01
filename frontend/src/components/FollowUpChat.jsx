import { useState } from 'react'
import { runFollowup } from '../api/tools'

export default function FollowUpChat({ toolName, result }) {
  const [question, setQuestion] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  async function handleSend() {
    const trimmed = question.trim()
    if (!trimmed || loading) return
    setLoading(true)
    try {
      const { answer } = await runFollowup(toolName, result, trimmed)
      setHistory((prev) => [...prev, { question: trimmed, answer }])
      setQuestion('')
    } catch {
      setHistory((prev) => [...prev, { question: trimmed, answer: 'Could not get an answer, try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <h3 className="font-bold text-teal mb-4 text-sm">Ask a follow-up question</h3>

      {history.length > 0 && (
        <div className="space-y-2 mb-4">
          {history.map((entry, i) => (
            <div key={i} className="space-y-2">
              <div className="bg-mint-light rounded-lg p-3 text-body text-sm">{entry.question}</div>
              <div className="bg-gray-50 rounded-lg p-3 text-body text-sm">{entry.answer}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about this result..."
          className="flex-1 bg-white border border-card-border rounded-[10px] px-4 py-2.5 text-sm text-body focus:outline-none focus:border-mint transition-colors duration-200"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={loading}
          className="bg-mint text-teal rounded-[10px] px-6 font-medium disabled:opacity-50 hover:brightness-90 transition-all duration-200"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
