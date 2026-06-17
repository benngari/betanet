// Betanet hotspot packages
// Mirrors the HighLinksTech tier structure, extended with a monthly plan.
// `profile` maps to the MikroTik hotspot user profile name on the router.

export const PACKAGES = [
  {
    id: 'connect-10',
    label: 'Connect',
    price: 10,
    duration: '2 Hours',
    speedTag: null,
    profile: 'hs-2hr',
    sessionSeconds: 2 * 60 * 60,
  },
  {
    id: 'connect-20',
    label: 'Connect',
    price: 20,
    duration: '4 Hours',
    speedTag: null,
    profile: 'hs-4hr',
    sessionSeconds: 4 * 60 * 60,
  },
  {
    id: 'connect-35',
    label: '20Mbps',
    price: 35,
    duration: '12 Hours',
    speedTag: '20 Mbps',
    profile: 'hs-12hr-20mbps',
    sessionSeconds: 12 * 60 * 60,
  },
  {
    id: 'connect-50',
    label: 'Connect',
    price: 50,
    duration: '1 Day',
    speedTag: null,
    profile: 'hs-1day',
    sessionSeconds: 24 * 60 * 60,
  },
  {
    id: 'connect-100',
    label: 'Connect',
    price: 100,
    duration: '3 Days',
    speedTag: null,
    profile: 'hs-3day',
    sessionSeconds: 3 * 24 * 60 * 60,
  },
  {
    id: 'connect-1000',
    label: 'Unlimited',
    price: 1000,
    duration: '30 Days',
    speedTag: 'Best value',
    profile: 'hs-30day',
    sessionSeconds: 30 * 24 * 60 * 60,
  },
]

export const getPackageById = (id) => PACKAGES.find((p) => p.id === id)
