import { useState, useRef, useEffect } from 'react'
import { initiatePayment, getPaymentStatus } from '../lib/api'

const PHONE_RE = /^0(7|1)\d{8}$/

function normalizePhone(input) {
  const digits = input.replace(/\D/g, '')
  if (digits.startsWith('254')) return '0' + digits.slice(3)
  return digits
}

const ICONS = {
  bulb: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.22-1.21 4.16-3 5.2V17H9v-2.8C7.21 13.16 6 11.22 6 9a6 6 0 0 1 6-6z"/>
    </svg>
  ),
  bolt: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M13 2L4.09 12.96A1 1 0 0 0 5 14.5h6.5L10 22l9.91-10.96A1 1 0 0 0 19 9.5H12.5L13 2z"/>
    </svg>
  ),
  fire: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2c0 0-5 4-5 9a5 5 0 0 0 10 0c0-2-1-4-2-5 0 2-1 3-2 3-1 0-1.5-1-1.5-2C11.5 5 12 2 12 2z"/>
    </svg>
  ),
}

export default function PackageCard({ pkg }) {
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState('idle')
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
      const { transactionId } = await initiatePayment({ phone: cleanPhone, packageId: pkg.id })
      setStatus('waiting')
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
            clearInterval(pollRef.current)
            setStatus('failed')
            setErrorMsg('Payment timed out. Please try again.')
          }
        } catch {}
      }, 2000)
    } catch (err) {
      setStatus('failed')
      setErrorMsg(err?.response?.data?.message || 'Could not start payment. Please try again.')
    }
  }

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border h-full flex flex-col ${
      pkg.highlight ? 'border-bn-blue ring-2 ring-bn-blue/20' : 'border-slate-100'
    }`}>

      {pkg.highlight && (
        <div className="text-center mb-3">
          <span className="inline-block bg-bn-blue text-white text-xs font-600 px-3 py-1 rounded-full tracking-wide">
            MOST POPULAR
          </span>
        </div>
      )}

      <div className="text-center mb-4 flex-1">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
          pkg.highlight ? 'bg-bn-blue text-white' : 'bg-bn-bg text-bn-blue'
        }`}>
          {ICONS[pkg.icon]}
        </div>
        <p className="font-display font-700 text-2xl text-bn-navy">
          Ksh {pkg.price.toLocaleString()}
          <span className="text-bn-slate-light font-400 text-sm">/month</span>
        </p>
        <p className="text-bn-blue font-600 text-lg mt-0.5">{pkg.speedTag}</p>
        <p className="text-xs text-bn-slate-light mt-1">Valid for {pkg.duration}</p>
      </div>

      {status === 'success' ? (
        <div className="text-center py-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
              <path d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <p className="font-600 text-bn-green text-sm">You're connected!</p>
          <p className="text-xs text-bn-slate-light mt-1">Enjoy your {pkg.duration} of access.</p>
        </div>
      ) : (
        <>
          <label className="block text-sm font-600 text-bn-navy mb-1.5 text-center">
            M-Pesa number
          </label>
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 mb-1 focus-within:border-bn-blue transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-bn-slate-light shrink-0">
              <rect x="7" y="2" width="10" height="20" rx="2"/>
              <path d="M11 18h2"/>
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
            className={`w-full mt-2 transition-colors text-white font-600 py-3 rounded-xl flex items-center justify-center gap-2 ${
              pkg.highlight
                ? 'bg-bn-blue hover:bg-bn-blue-dark disabled:bg-slate-200 disabled:text-slate-400'
                : 'bg-bn-navy hover:bg-bn-navy-light disabled:bg-slate-200 disabled:text-slate-400'
            }`}
          >
            {status === 'sending' && 'Sending request…'}
            {status === 'waiting' && (
              <><span className="w-2 h-2 rounded-full bg-white/80 animate-pulse"/>Check your phone…</>
            )}
            {(status === 'idle' || status === 'failed') && `Subscribe — Ksh ${pkg.price.toLocaleString()}/mo`}
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
