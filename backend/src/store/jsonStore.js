// Minimal file-backed persistence so this project runs with zero native
// dependencies out of the box. Swap this module for a real Postgres/MySQL
// layer before going to production — see README "Going to production".

const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', '..', 'data')
const TX_FILE = path.join(DATA_DIR, 'transactions.json')
const VOUCHER_FILE = path.join(DATA_DIR, 'vouchers.json')

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(TX_FILE)) fs.writeFileSync(TX_FILE, '{}')
  if (!fs.existsSync(VOUCHER_FILE)) fs.writeFileSync(VOUCHER_FILE, '{}')
}

function readJson(file) {
  ensureStore()
  return JSON.parse(fs.readFileSync(file, 'utf-8'))
}

function writeJson(file, data) {
  ensureStore()
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

// ---------- Transactions ----------
// shape: { id, phone, packageId, amount, status, checkoutRequestId,
//          mpesaReceipt, createdAt, updatedAt, failReason }

function createTransaction(tx) {
  const all = readJson(TX_FILE)
  all[tx.id] = { ...tx, createdAt: Date.now(), updatedAt: Date.now() }
  writeJson(TX_FILE, all)
  return all[tx.id]
}

function getTransaction(id) {
  const all = readJson(TX_FILE)
  return all[id] || null
}

function findTransactionByCheckoutId(checkoutRequestId) {
  const all = readJson(TX_FILE)
  return Object.values(all).find((t) => t.checkoutRequestId === checkoutRequestId) || null
}

function updateTransaction(id, patch) {
  const all = readJson(TX_FILE)
  if (!all[id]) return null
  all[id] = { ...all[id], ...patch, updatedAt: Date.now() }
  writeJson(TX_FILE, all)
  return all[id]
}

// ---------- Vouchers (active hotspot grants) ----------
// keyed by phone number; shape: { phone, packageId, profile, mpesaReceipt,
//          activatedAt, expiresAt, routerUsername }

function upsertVoucher(phone, voucher) {
  const all = readJson(VOUCHER_FILE)
  all[phone] = { phone, ...voucher }
  writeJson(VOUCHER_FILE, all)
  return all[phone]
}

function getVoucherByPhone(phone) {
  const all = readJson(VOUCHER_FILE)
  return all[phone] || null
}

module.exports = {
  createTransaction,
  getTransaction,
  findTransactionByCheckoutId,
  updateTransaction,
  upsertVoucher,
  getVoucherByPhone,
}
