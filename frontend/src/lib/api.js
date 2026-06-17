import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// Kick off an STK push for a package purchase.
// Backend creates a pending transaction and returns its id for polling.
export async function initiatePayment({ phone, packageId }) {
  const { data } = await api.post('/payments/stk-push', { phone, packageId })
  return data // { transactionId, checkoutRequestId, message }
}

// Poll payment + hotspot provisioning status.
export async function getPaymentStatus(transactionId) {
  const { data } = await api.get(`/payments/${transactionId}/status`)
  return data // { status: 'pending' | 'success' | 'failed', message, voucher? }
}

// Login with an existing voucher / phone number (already subscribed).
export async function activateExisting({ phone }) {
  const { data } = await api.post('/hotspot/activate', { phone })
  return data
}
