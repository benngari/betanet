const STEPS = [
  'Tap the package you want to purchase',
  'Enter your M-Pesa phone number',
  'Tap Subscribe',
  'Enter your M-Pesa PIN in the prompt',
  'Wait a few seconds to be connected',
  'If not connected, contact customer care 0722 852 628',
]

export default function HowToPurchase({ onLoginClick }) {
  return (
    <div className="bg-slate-100 rounded-2xl p-5 md:p-6 -mt-4 relative z-10 max-w-md md:max-w-3xl lg:max-w-5xl mx-auto border border-slate-200">
      <div className="md:flex md:items-start md:gap-10">
        <div className="md:flex-1">
          <div className="flex items-center gap-2 mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-bn-green">
              <rect x="6" y="4" width="12" height="17" rx="2" />
              <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
            </svg>
            <h2 className="font-display font-600 text-bn-navy">How to purchase</h2>
          </div>
          <ol className="space-y-2.5 max-w-sm">
            {STEPS.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-bn-slate leading-snug">
                <span className="font-display font-700 text-bn-green shrink-0 w-4">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="text-center md:text-left mt-5 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-200 md:pl-10 md:w-64 shrink-0 flex flex-col">
          <p className="text-sm text-bn-slate">
            Need help? <a href="tel:0731389206" className="font-700 text-bn-navy underline">0731 389 206</a>
          </p>
          <button
            onClick={onLoginClick}
            className="mt-4 flex items-center justify-center gap-2 bg-bn-green hover:bg-bn-green-dark transition-colors text-white font-600 py-3 rounded-xl"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 17l5-5-5-5M20 12H4" />
            </svg>
            Already subscribed? Activate
          </button>
        </div>
      </div>
    </div>
  )
}
