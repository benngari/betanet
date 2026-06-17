const express = require('express')
const store = require('../store/jsonStore')

const router = express.Router()

function normalizePhone(input) {
  const digits = String(input).replace(/\D/g, '')
  if (digits.startsWith('254')) return '0' + digits.slice(3)
  return digits
}

// POST /api/hotspot/activate
// Used by the "Already subscribed?" flow — looks up a still-valid voucher
// for this phone number rather than taking a new payment.
router.post('/activate', (req, res) => {
  const phone = normalizePhone(req.body?.phone || '')
  const voucher = store.getVoucherByPhone(phone)

  if (!voucher) {
    return res.json({ active: false, message: 'No package found for this number.' })
  }

  if (voucher.expiresAt < Date.now()) {
    return res.json({ active: false, message: 'Your last package has expired. Please subscribe again.' })
  }

  const minutesLeft = Math.round((voucher.expiresAt - Date.now()) / 60000)
  res.json({
    active: true,
    message: `Connected. Time remaining: ${minutesLeft} minute(s).`,
  })
})

module.exports = router
