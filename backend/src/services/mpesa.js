// M-Pesa Daraja (Lipa na M-Pesa Online / STK Push) integration.
//
// Required env vars (see .env.example):
//   MPESA_ENV                 'sandbox' | 'production'
//   MPESA_CONSUMER_KEY
//   MPESA_CONSUMER_SECRET
//   MPESA_SHORTCODE           Your Paybill/Till number (or sandbox shortcode)
//   MPESA_PASSKEY             Lipa Na M-Pesa Online Passkey
//   MPESA_CALLBACK_URL        Public HTTPS URL Safaricom will POST results to
//
// Docs: https://developer.safaricom.co.ke/Documentation

const axios = require('axios')

const BASE_URL =
  process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke'

let cachedToken = null
let cachedTokenExpiry = 0

async function getAccessToken() {
  if (cachedToken && Date.now() < cachedTokenExpiry) return cachedToken

  const key = process.env.MPESA_CONSUMER_KEY
  const secret = process.env.MPESA_CONSUMER_SECRET
  if (!key || !secret) {
    throw new Error('MPESA_CONSUMER_KEY / MPESA_CONSUMER_SECRET not configured')
  }

  const auth = Buffer.from(`${key}:${secret}`).toString('base64')
  const { data } = await axios.get(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  )

  cachedToken = data.access_token
  // Tokens last 3600s — refresh a minute early to be safe.
  cachedTokenExpiry = Date.now() + (Number(data.expires_in || 3599) - 60) * 1000
  return cachedToken
}

function timestampNow() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  )
}

function buildPassword(timestamp) {
  const shortcode = process.env.MPESA_SHORTCODE
  const passkey = process.env.MPESA_PASSKEY
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')
}

// Normalizes 07XXXXXXXX / 01XXXXXXXX into 254XXXXXXXXX for Daraja.
function toMsisdn(phone) {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('254')) return digits
  if (digits.startsWith('0')) return '254' + digits.slice(1)
  return digits
}

/**
 * Initiates an STK push prompt on the customer's phone.
 * @returns {Promise<{checkoutRequestId: string, merchantRequestId: string}>}
 */
async function initiateStkPush({ phone, amount, accountReference, description }) {
  const token = await getAccessToken()
  const timestamp = timestampNow()
  const password = buildPassword(timestamp)
  const shortcode = process.env.MPESA_SHORTCODE

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: toMsisdn(phone),
    PartyB: shortcode,
    PhoneNumber: toMsisdn(phone),
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: accountReference.slice(0, 12), // Daraja limits this field
    TransactionDesc: description.slice(0, 13),
  }

  const { data } = await axios.post(
    `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  // ResponseCode '0' means Safaricom accepted the request — the customer
  // still has to enter their PIN; the real result arrives at the callback URL.
  if (data.ResponseCode !== '0') {
    throw new Error(data.ResponseDescription || 'STK push was rejected by Safaricom')
  }

  return {
    checkoutRequestId: data.CheckoutRequestID,
    merchantRequestId: data.MerchantRequestID,
  }
}

/**
 * Parses the callback payload Safaricom POSTs to MPESA_CALLBACK_URL.
 * Returns a normalized result regardless of success/failure.
 */
function parseStkCallback(body) {
  const callback = body?.Body?.stkCallback
  if (!callback) return null

  const { CheckoutRequestID, ResultCode, ResultDesc } = callback

  if (ResultCode === 0) {
    const items = callback.CallbackMetadata?.Item || []
    const get = (name) => items.find((i) => i.Name === name)?.Value
    return {
      checkoutRequestId: CheckoutRequestID,
      success: true,
      mpesaReceipt: get('MpesaReceiptNumber'),
      amount: get('Amount'),
      phone: String(get('PhoneNumber') || ''),
      transactionDate: get('TransactionDate'),
    }
  }

  return {
    checkoutRequestId: CheckoutRequestID,
    success: false,
    resultCode: ResultCode,
    reason: ResultDesc,
  }
}

module.exports = { initiateStkPush, parseStkCallback, toMsisdn }
