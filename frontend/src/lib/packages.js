// BetaNet Solutions — monthly subscription packages (from poster)
// Keep in sync with backend/src/packages.js

export const PACKAGES = [
  {
    id: 'basic-3mbps',
    label: '3 Mbps',
    price: 1000,
    duration: '30 Days',
    speedTag: '3 Mbps',
    profile: 'hs-3mbps-30day',
    sessionSeconds: 30 * 24 * 60 * 60,
    icon: 'bulb',
    highlight: false,
  },
  {
    id: 'standard-5mbps',
    label: '5 Mbps',
    price: 1500,
    duration: '30 Days',
    speedTag: '5 Mbps',
    profile: 'hs-5mbps-30day',
    sessionSeconds: 30 * 24 * 60 * 60,
    icon: 'bolt',
    highlight: true, // most popular
  },
  {
    id: 'premium-10mbps',
    label: '10 Mbps',
    price: 2000,
    duration: '30 Days',
    speedTag: '10 Mbps',
    profile: 'hs-10mbps-30day',
    sessionSeconds: 30 * 24 * 60 * 60,
    icon: 'fire',
    highlight: false,
  },
]

export const getPackageById = (id) => PACKAGES.find((p) => p.id === id)
