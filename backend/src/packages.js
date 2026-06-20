// BetaNet Solutions — monthly subscription packages
// Keep in sync with frontend/src/lib/packages.js

const PACKAGES = {
  'basic-3mbps': {
    id: 'basic-3mbps',
    label: '3 Mbps',
    price: 1000,
    duration: '30 Days',
    profile: 'hs-3mbps-30day',
    sessionSeconds: 30 * 24 * 60 * 60,
  },
  'standard-5mbps': {
    id: 'standard-5mbps',
    label: '5 Mbps',
    price: 1500,
    duration: '30 Days',
    profile: 'hs-5mbps-30day',
    sessionSeconds: 30 * 24 * 60 * 60,
  },
  'premium-10mbps': {
    id: 'premium-10mbps',
    label: '10 Mbps',
    price: 2000,
    duration: '30 Days',
    profile: 'hs-10mbps-30day',
    sessionSeconds: 30 * 24 * 60 * 60,
  },
}

function getPackage(id) {
  return PACKAGES[id] || null
}

module.exports = { PACKAGES, getPackage }
