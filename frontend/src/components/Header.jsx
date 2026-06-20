export default function Header() {
  return (
    <header className="bg-bn-navy">
      <div className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-5 pt-10 pb-8 flex flex-col items-center">

        {/* WiFi icon — full size matching the poster */}
        <svg
          viewBox="0 0 80 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-24 h-20 mb-4"
          aria-hidden="true"
        >
          {/* outer arc */}
          <path d="M4 28 C18 6 62 6 76 28" stroke="#93C5FD" strokeWidth="6" strokeLinecap="round" fill="none"
            className="signal-bar" style={{ animationDelay: '0ms' }} />
          {/* middle arc */}
          <path d="M15 38 C24 22 56 22 65 38" stroke="#60A5FA" strokeWidth="6" strokeLinecap="round" fill="none"
            className="signal-bar" style={{ animationDelay: '120ms' }} />
          {/* inner arc */}
          <path d="M27 48 C31 38 49 38 53 48" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none"
            className="signal-bar" style={{ animationDelay: '240ms' }} />
          {/* dot */}
          <circle cx="40" cy="57" r="4.5" fill="white"
            className="signal-bar" style={{ animationDelay: '360ms' }} />
        </svg>

        <h1 className="font-display font-700 text-3xl md:text-4xl tracking-tight text-white">
          BetaNet <span className="text-bn-sky">Solutions</span>
        </h1>
        <p className="font-body text-sm md:text-base font-600 tracking-widest uppercase text-bn-sky-light mt-1.5">
          Stay Connected, Stay Ahead
        </p>
        <p className="font-body text-sm text-white/70 mt-2 text-center max-w-xs">
          Enjoy fast, reliable, and affordable internet right where you are.
        </p>
      </div>
    </header>
  )
}