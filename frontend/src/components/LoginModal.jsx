import { useState } from 'react'
import { activateExisting } from '../lib/api'

export default function LoginModal({ open, onClose }) {
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState('idle') // idle | checking | success | failed
  const [message, setMessage] = useState('')

  if (!open) return null

  async function handleActivate() {
    setStatus('checking')
    setMessage('')
    try {
      const res = await activateExisting({ phone })
      if (res.active) {
        setStatus('success')
        setMessage(res.message || 'Connected successfully.')
      } else {
        setStatus('failed')
        setMessage(res.message || 'No active package found for this number.')
      }
    } catch (err) {
      setStatus('failed')
      setMessage(err?.response?.data?.message || 'Something went wrong. Try again.')
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-5"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display font-700 text-bn-navy text-lg mb-1">Activate package</h3>
        <p className="text-sm text-bn-slate-light mb-4">
          Enter the phone number you subscribed with.
        </p>

        <input
          type="tel"
          inputMode="numeric"
          placeholder="0712345678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-bn-blue mb-3"
        />

        {message && (
          <p className={`text-xs mb-3 ${status === 'success' ? 'text-bn-green' : 'text-bn-red'}`}>
            {message}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-bn-slate font-600 text-sm"
          >
            Close
          </button>
          <button
            onClick={handleActivate}
            disabled={status === 'checking' || !phone}
            className="flex-1 py-2.5 rounded-xl bg-bn-blue hover:bg-bn-blue-dark disabled:bg-slate-200 text-white font-600 text-sm transition-colors"
          >
            {status === 'checking' ? 'Checking…' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  )
}
