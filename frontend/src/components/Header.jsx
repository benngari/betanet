export default function Header() {
  return (
    <header className="bg-bn-navy">
      <div className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-5 pt-10 pb-8 flex flex-col items-center">
        <div className="flex items-end gap-1.5 md:gap-2 mb-3" aria-hidden="true">
          <span
            className="signal-bar block w-1.5 md:w-2 h-3 md:h-4 rounded-sm bg-bn-sky-light"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="signal-bar block w-1.5 md:w-2 h-5 md:h-6 rounded-sm bg-bn-sky"
            style={{ animationDelay: '90ms' }}
          />
          <span
            className="signal-bar block w-1.5 md:w-2 h-7 md:h-9 rounded-sm bg-bn-blue"
            style={{ animationDelay: '180ms' }}
          />
          <span
            className="signal-bar block w-1.5 md:w-2 h-9 md:h-12 rounded-sm bg-bn-blue-dark"
            style={{ animationDelay: '270ms' }}
          />
        </div>
        <h1 className="font-display font-700 text-3xl md:text-4xl tracking-tight text-white">
          BETANET
        </h1>
        <p className="font-body text-sm md:text-base text-bn-sky-light mt-1">
          Fast, reliable WiFi for home and business
        </p>
      </div>
    </header>
  )
}
