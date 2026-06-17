const express = require('express')
const { nanoid } = require('nanoid')
const { getPackage } = require('../packages')
const mpesa = require('../services/mpesa')
const mikrotik = require('../services/mikrotik')
const store = require('../store/jsonStore')

const router = express.Router()

const PHONE_RE = /^0(7|1)\d{8}$/

function normalizePhone(input) {
  const digits = String(input).replace(/\D/g, '')
  if (digits.startsWith('254')) return '0' + digits.slice(3)
  return digits
}

// POST /api/payments/stk-push
// Body: { phone, packageId }
router.post('/stk-push', async (req, res) => {
  const { phone, packageId } = req.body || {}
  const cleanPhone = normalizePhone(phone || '')

  if (!PHONE_RE.test(cleanPhone)) {
    return res.status(400).json({ message: 'Enter a valid M-Pesa number, e.g. 0712345678' })
  }

  const pkg = getPackage(packageId)
  if (!pkg) {
    return res.status(400).json({ message: 'Unknown package selected' })
  }

  const transactionId = nanoid(12)

  try {
    const { checkoutRequestId } = await mpesa.initiateStkPush({
      phone: cleanPhone,
      amount: pkg.price,
      accountReference: 'BETANET',
      description: `${pkg.label} ${pkg.duration}`,
    })

    store.createTransaction({
      id: transactionId,
      phone: cleanPhone,
      packageId: pkg.id,
      amount: pkg.price,
      status: 'pending',
      checkoutRequestId,
    })

    res.json({
      transactionId,
      checkoutRequestId,
      message: 'STK push sent. Enter your M-Pesa PIN to complete payment.',
    })
  } catch (err) {
    console.error('STK push failed:', err.message)
    res.status(502).json({
      message: 'Could not reach M-Pesa right now. Please try again shortly.',
    })
  }
})

// GET /api/payments/:transactionId/status
// Frontend polls this every couple of seconds while waiting for the
// customer to enter their PIN. Resolves to success once both the M-Pesa
// callback has confirmed payment AND the router has granted access.
router.get('/:transactionId/status', (req, res) => {
  const tx = store.getTransaction(req.params.transactionId)
  if (!tx) return res.status(404).json({ status: 'failed', message: 'Transaction not found' })

  res.json({
    status: tx.status, // 'pending' | 'success' | 'failed'
    message: tx.failReason || undefined,
    voucher:
      tx.status === 'success'
        ? { username: tx.routerUsername, password: tx.routerPassword }
        : undefined,
  })
})

// POST /api/payments/mpesa-callback
// Safaricom POSTs the final payment result here (set as MPESA_CALLBACK_URL).
// This route provisions the MikroTik hotspot user once payment is confirmed.
router.post('/mpesa-callback', async (req, res) => {
  // Always acknowledge receipt immediately so Safaricom doesn't retry —
  // do the slow work (router API call) after responding.
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' })

  const result = mpesa.parseStkCallback(req.body)
  if (!result) {
    console.warn('Received malformed M-Pesa callback', JSON.stringify(req.body))
    return
  }

  const tx = store.findTransactionByCheckoutId(result.checkoutRequestId)
  if (!tx) {
    console.warn('No matching transaction for checkoutRequestId', result.checkoutRequestId)
    return
  }

  if (!result.success) {
    store.updateTransaction(tx.id, {
      status: 'failed',
      failReason: result.reason || 'Payment was cancelled or timed out.',
    })
    return
  }

  const pkg = getPackage(tx.packageId)

  try {
    const { username, password } = await mikrotik.provisionHotspotUser({
      phone: tx.phone,
      profile: pkg.profile,
      sessionSeconds: pkg.sessionSeconds,
    })

    store.upsertVoucher(tx.phone, {
      packageId: pkg.id,
      profile: pkg.profile,
      mpesaReceipt: result.mpesaReceipt,
      activatedAt: Date.now(),
      expiresAt: Date.now() + pkg.sessionSeconds * 1000,
      routerUsername: username,
    })

    store.updateTransaction(tx.id, {
      status: 'success',
      mpesaReceipt: result.mpesaReceipt,
      routerUsername: username,
      routerPassword: password,
    })
  } catch (err) {
    console.error('MikroTik provisioning failed after successful payment:', err.message)
    // Payment succeeded but the router call failed — flag for manual/ops
    // follow-up rather than silently losing the paid customer.
    store.updateTransaction(tx.id, {
      status: 'failed',
      failReason:
        'Payment received but we could not connect you automatically. Contact support with your M-Pesa receipt.',
      mpesaReceipt: result.mpesaReceipt,
    })
  }
})

module.exports = router
