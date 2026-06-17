// MikroTik RouterOS integration — creates/removes hotspot users so a paid
// customer is actually granted internet access on the router.
//
// Required env vars (see .env.example):
//   MIKROTIK_HOST       Router LAN/management IP, e.g. 192.168.88.1
//   MIKROTIK_USER       API user with hotspot write permissions
//   MIKROTIK_PASSWORD
//   MIKROTIK_PORT       8728 (plain) or 8729 (TLS) — default 8728
//   MIKROTIK_USE_TLS    'true' to use the encrypted API port
//
// Each package maps to a RouterOS hotspot "user profile" (rate limit,
// shared-users, etc.) that must already exist on the router — see README
// "MikroTik setup" for the exact profile + queue configuration.
//
// Docs: https://help.mikrotik.com/docs/display/ROS/API

const { RouterOSAPI } = require('node-routeros')

function buildClient() {
  return new RouterOSAPI({
    host: process.env.MIKROTIK_HOST,
    user: process.env.MIKROTIK_USER,
    password: process.env.MIKROTIK_PASSWORD,
    port: Number(process.env.MIKROTIK_PORT) || (process.env.MIKROTIK_USE_TLS === 'true' ? 8729 : 8728),
    tls: process.env.MIKROTIK_USE_TLS === 'true' ? {} : undefined,
    timeout: 8,
  })
}

// Generates a short numeric voucher password — fine for hotspot login since
// the username (phone number) is already the meaningful identifier.
function generateVoucherPassword() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Creates (or replaces) a hotspot user for this phone number, scoped to the
 * purchased package's profile and uptime limit, then returns login creds.
 */
async function provisionHotspotUser({ phone, profile, sessionSeconds }) {
  const client = buildClient()
  await client.connect()

  try {
    // Remove any existing user with this username so re-subscribing
    // (e.g. buying a new package on an old number) doesn't collide.
    const existing = await client.write('/ip/hotspot/user/print', [
      `?name=${phone}`,
    ])
    for (const row of existing) {
      await client.write('/ip/hotspot/user/remove', [`=.id=${row['.id']}`])
    }

    const password = generateVoucherPassword()
    const limitUptime = secondsToRouterOsDuration(sessionSeconds)

    await client.write('/ip/hotspot/user/add', [
      `=name=${phone}`,
      `=password=${password}`,
      `=profile=${profile}`,
      `=limit-uptime=${limitUptime}`,
      '=comment=betanet-auto',
    ])

    return { username: phone, password }
  } finally {
    client.close()
  }
}

/**
 * Disconnects an active hotspot session early (e.g. on refund or abuse).
 */
async function disconnectUser(phone) {
  const client = buildClient()
  await client.connect()
  try {
    const active = await client.write('/ip/hotspot/active/print', [`?user=${phone}`])
    for (const row of active) {
      await client.write('/ip/hotspot/active/remove', [`=.id=${row['.id']}`])
    }
  } finally {
    client.close()
  }
}

// Converts seconds into RouterOS's "1d02h03m04s" uptime-limit format.
function secondsToRouterOsDuration(totalSeconds) {
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  let out = ''
  if (days) out += `${days}d`
  if (hours) out += `${hours}h`
  if (minutes) out += `${minutes}m`
  if (seconds || out === '') out += `${seconds}s`
  return out
}

module.exports = { provisionHotspotUser, disconnectUser }
