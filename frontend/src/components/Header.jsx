export default function Header() {
  return (
    <header className="bg-bn-navy">
      <div className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-5 pt-10 pb-8 flex flex-col items-center">

        {/* WiFi icon matching the poster */}
        <svg
          viewBox="0 0 64 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-16 h-10 mb-3"
          aria-hidden="true"
        >
          {/* 3 wifi arcs, outer → inner, cyan to white */}
          <path d="M2 18 C14 4 50 4 62 18" stroke="#7DD3FC" strokeWidth="5" strokeLinecap="round" fill="none"
            className="signal-bar" style={{ animationDelay: '0ms' }} />
          <path d="M11 26 C18 16 46 16 53 26" stroke="#38BDF8" strokeWidth="5" strokeLinecap="round" fill="none"
            className="signal-bar" style={{ animationDelay: '100ms' }} />
          <path d="M20 33 C23 27 41 27 44 33" stroke="white" strokeWidth="5" strokeLinecap="round" fill="none"
            className="signal-bar" style={{ animationDelay: '200ms' }} />
          {/* dot */}
          <circle cx="32" cy="39" r="3.5" fill="white"
            className="signal-bar" style={{ animationDelay: '300ms' }} />
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
