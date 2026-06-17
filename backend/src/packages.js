// Betanet hotspot packages — keep in sync with frontend/src/lib/packages.js
// `profile` is the MikroTik hotspot user profile name configured on the router.
// `sessionSeconds` is used to set the RouterOS "limit-uptime" for the created user.

const PACKAGES = {
  'connect-10': {
    id: 'connect-10',
    label: 'Connect',
    price: 10,
    duration: '2 Hours',
    profile: 'hs-2hr',
    sessionSeconds: 2 * 60 * 60,
  },
  'connect-20': {
    id: 'connect-20',
    label: 'Connect',
    price: 20,
    duration: '4 Hours',
    profile: 'hs-4hr',
    sessionSeconds: 4 * 60 * 60,
  },
  'connect-35': {
    id: 'connect-35',
    label: '20Mbps',
    price: 35,
    duration: '12 Hours',
    profile: 'hs-12hr-20mbps',
    sessionSeconds: 12 * 60 * 60,
  },
  'connect-50': {
    id: 'connect-50',
    label: 'Connect',
    price: 50,
    duration: '1 Day',
    profile: 'hs-1day',
    sessionSeconds: 24 * 60 * 60,
  },
  'connect-100': {
    id: 'connect-100',
    label: 'Connect',
    price: 100,
    duration: '3 Days',
    profile: 'hs-3day',
    sessionSeconds: 3 * 24 * 60 * 60,
  },
  'connect-1000': {
    id: 'connect-1000',
    label: 'Unlimited',
    price: 1000,
    duration: '30 Days',
    profile: 'hs-30day',
    sessionSeconds: 30 * 24 * 60 * 60,
  },
}

function getPackage(id) {
  return PACKAGES[id] || null
}

module.exports = { PACKAGES, getPackage }
