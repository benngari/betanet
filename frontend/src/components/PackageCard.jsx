import { useState, useRef, useEffect } from 'react'
import { initiatePayment, getPaymentStatus } from '../lib/api'

const PHONE_RE = /^0(7|1)\d{8}$/

function normalizePhone(input) {
  const digits = input.replace(/\D/g, '')
  if (digits.startsWith('254')) return '0' + digits.slice(3)
  return digits
}

export default function PackageCard({ pkg }) {
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | waiting | success | failed
  const [errorMsg, setErrorMsg] = useState('')
  const pollRef = useRef(null)

  useEffect(() => () => clearInterval(pollRef.current), [])

  const isValid = PHONE_RE.test(normalizePhone(phone))

  async function handleSubscribe() {
    setErrorMsg('')
    const cleanPhone = normalizePhone(phone)
    if (!PHONE_RE.test(cleanPhone)) {
      setErrorMsg('Enter a valid M-Pesa number, e.g. 0712345678')
      return
    }

    setStatus('sending')
    try {
      const { transactionId } = await initiatePayment({
        phone: cleanPhone,
        packageId: pkg.id,
      })
      setStatus('waiting')

      // Poll for STK push + hotspot provisioning result
      let attempts = 0
      pollRef.current = setInterval(async () => {
        attempts += 1
        try {
          const result = await getPaymentStatus(transactionId)
          if (result.status === 'success') {
            clearInterval(pollRef.current)
            setStatus('success')
          } else if (result.status === 'failed') {
            clearInterval(pollRef.current)
            setStatus('failed')
            setErrorMsg(result.message || 'Payment was not completed.')
          } else if (attempts > 30) {
            // ~60s timeout at 2s intervals
            clearInterval(pollRef.current)
            setStatus('failed')
            setErrorMsg('Payment timed out. Please try again.')
          }
        } catch {
          // transient network hiccup while polling — keep waiting until timeout
        }
      }, 2000)
    } catch (err) {
      setStatus('failed')
      setErrorMsg(
        err?.response?.data?.message || 'Could not start payment. Please try again.'
      )
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 h-full">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2">
          <h3 className="font-display font-700 text-lg text-bn-navy">
            {pkg.label} <span className="text-bn-blue">@ Ksh {pkg.price}</span>
          </h3>
        </div>
        <p className="text-sm text-bn-slate-light mt-0.5">Valid for {pkg.duration}</p>
        {pkg.speedTag && (
          <span className="inline-block mt-2 text-xs font-600 px-2.5 py-1 rounded-full bg-bn-sky-light/40 text-bn-blue-dark">
            {pkg.speedTag}
          </span>
        )}
      </div>

      {status === 'success' ? (
        <div className="text-center py-2">
          <div className="w-10 h-10 rounded-full bg-bn-green/10 flex items-center justify-center mx-auto mb-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-600 text-bn-green text-sm">You're connected!</p>
          <p className="text-xs text-bn-slate-light mt-1">Enjoy your {pkg.duration.toLowerCase()} of access.</p>
        </div>
      ) : (
        <>
          <label className="block text-sm font-600 text-bn-navy mb-1.5 text-center">
            Phone number
          </label>
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 mb-1 focus-within:border-bn-blue transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-bn-slate-light shrink-0">
              <rect x="7" y="2" width="10" height="20" rx="2" />
              <path d="M11 18h2" />
            </svg>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="0712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={status === 'sending' || status === 'waiting'}
              className="flex-1 outline-none text-sm placeholder:text-slate-300 disabled:bg-transparent disabled:text-slate-400"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-bn-red mb-2 text-center">{errorMsg}</p>
          )}

          <button
            onClick={handleSubscribe}
            disabled={!isValid || status === 'sending' || status === 'waiting'}
            className="w-full mt-2 bg-bn-green hover:bg-bn-green-dark disabled:bg-slate-200 disabled:text-slate-400 transition-colors text-white font-600 py-3 rounded-xl flex items-center justify-center gap-2"
          >
            {status === 'sending' && 'Sending request…'}
            {status === 'waiting' && (
              <>
                <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
                Check your phone…
              </>
            )}
            {(status === 'idle' || status === 'failed') && `Subscribe for Ksh ${pkg.price}`}
          </button>

          {status === 'waiting' && (
            <p className="text-xs text-center text-bn-slate-light mt-2">
              Enter your M-Pesa PIN on the prompt sent to {phone}
            </p>
          )}
        </>
      )}
    </div>
  )
}
