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
    <div className="mt-10 pt-8 border-t border-mint-border">
      <h3 className="font-bold text-teal mb-4">Ask a follow-up question</h3>

      {history.length > 0 && (
        <div className="space-y-4 mb-4">
          {history.map((entry, i) => (
            <div key={i} className="space-y-2">
              <div className="bg-mint-light border border-mint-border rounded-xl p-4 text-body">
                {entry.question}
              </div>
              <div className="bg-white border border-mint-border rounded-xl p-4 text-body">
                {entry.answer}
              </div>
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
          className="flex-1 bg-mint-light border border-mint-border rounded-lg px-4 py-2 text-body focus:outline-none focus:border-mint"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={loading}
          className="bg-mint text-teal rounded-lg px-6 py-2 font-medium disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
