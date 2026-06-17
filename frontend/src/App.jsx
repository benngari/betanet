import { useState } from 'react'
import Header from './components/Header'
import HowToPurchase from './components/HowToPurchase'
import PackageCard from './components/PackageCard'
import LoginModal from './components/LoginModal'
import { PACKAGES } from './lib/packages'

export default function App() {
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bn-bg pb-12">
      <Header />
      <HowToPurchase onLoginClick={() => setLoginOpen(true)} />

      <main className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-5 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {PACKAGES.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </main>

      <footer className="text-center text-xs text-bn-slate-light mt-10">
        Betanet · Powered by your local router
      </footer>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  )
}
