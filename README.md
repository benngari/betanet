# Betanet — MikroTik hotspot billing with M-Pesa

A captive-portal billing app for MikroTik hotspots, styled after the
HighLinksTech portal you shared, rebranded as **Betanet** with a navy/blue
theme. Customers pick a package, pay by M-Pesa STK push, and the backend
provisions a hotspot login on your router automatically.

```
betanet/
├── frontend/   React + Vite + Tailwind captive portal UI
└── backend/    Node/Express API — M-Pesa Daraja + MikroTik RouterOS
```

## Packages

| Package    | Price     | Duration  | Notes        |
|------------|-----------|-----------|--------------|
| Connect    | Ksh 10    | 2 hours   |              |
| Connect    | Ksh 20    | 4 hours   |              |
| 20Mbps     | Ksh 35    | 12 hours  | Rate-limited |
| Connect    | Ksh 50    | 1 day     |              |
| Connect    | Ksh 100   | 3 days    |              |
| Unlimited  | Ksh 1000  | 30 days   | Monthly plan |

Edit `frontend/src/lib/packages.js` and `backend/src/packages.js` together if
you change pricing or durations — keep both in sync.

## How it works

1. Customer opens the portal (your router redirects unauthenticated traffic
   here), picks a package, and enters their phone number.
2. Frontend calls `POST /api/payments/stk-push` — backend asks Safaricom to
   push an STK prompt to that phone.
3. Customer enters their M-Pesa PIN. Safaricom calls your backend's
   `/api/payments/mpesa-callback` with the result.
4. On success, the backend connects to your MikroTik router over the
   RouterOS API and creates a hotspot user scoped to the package's profile
   and time limit, then the frontend (which has been polling
   `/api/payments/:id/status`) shows "You're connected."
5. Returning customers within their paid window can tap **Already
   subscribed?** to re-check their access without paying again.

## MikroTik setup

The backend assumes these hotspot user **profiles** already exist on your
router (Hotspot > User Profiles). Create one per package — name them exactly
as below or update `profile` in `backend/src/packages.js` to match:

| Profile name        | Suggested rate limit | Shared users |
|----------------------|----------------------|--------------|
| `hs-2hr`             | unrestricted or your default | 1 |
| `hs-4hr`              | unrestricted | 1 |
| `hs-12hr-20mbps`      | 20M/20M | 1 |
| `hs-1day`             | unrestricted | 1 |
| `hs-3day`             | unrestricted | 1 |
| `hs-30day`            | unrestricted | 1 |

The backend sets `limit-uptime` per-user based on the package, so the
profile itself doesn't need a time limit — just the rate limit and shared
user count.

Create an API user with hotspot-management rights instead of using your
admin login:

```
/user group add name=betanet-api policy=read,write,api,!ftp,!reboot,!password,!policy
/user add name=betanet-api group=betanet-api password=<a-strong-password>
```

Then in `backend/.env`:

```
MIKROTIK_HOST=192.168.88.1      # your router's LAN IP
MIKROTIK_USER=betanet-api
MIKROTIK_PASSWORD=<that password>
MIKROTIK_PORT=8728               # 8729 if MIKROTIK_USE_TLS=true
```

If the backend runs on a separate machine from the router (e.g. deployed on
Vercel/Railway), the router's API port must be reachable from that machine —
either port-forward it on your network or run the backend on a local
machine/VPS with a site-to-site link, since the RouterOS API isn't designed
to be exposed directly to the public internet without a VPN in front of it.

## M-Pesa Daraja setup

1. Create an app at the [Safaricom Developer Portal](https://developer.safaricom.co.ke)
   to get a Consumer Key/Secret.
2. For production, apply for **Lipa Na M-Pesa Online** (STK Push) on your
   Paybill/Till and get your **Passkey** from Safaricom.
3. Fill in `backend/.env`:

```
MPESA_ENV=sandbox                 # switch to production when ready
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=...                # your Paybill/Till, or the sandbox shortcode
MPESA_PASSKEY=...
MPESA_CALLBACK_URL=https://your-domain.com/api/payments/mpesa-callback
```

`MPESA_CALLBACK_URL` must be a **public HTTPS URL** Safaricom can reach —
while testing locally, run the backend through a tunnel like ngrok and use
that URL here.

## Running locally

```bash
# Backend
cd backend
cp .env.example .env   # then fill in real values
npm install
npm run dev             # http://localhost:4000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev              # http://localhost:5173, proxies /api to the backend
```

## Going to production

- **Database**: this starter uses a JSON file store (`backend/data/`) so it
  runs with zero native dependencies. Swap `backend/src/store/jsonStore.js`
  for Postgres (or your DB of choice) before relying on this for real
  traffic — the function signatures are small and easy to keep, just back
  them with real queries instead of file reads.
- **Backend hosting**: needs network access to your MikroTik router, so a
  VPS or a machine on the same network as the router works better than a
  serverless platform unless you set up a VPN/tunnel to the router.
- **Frontend hosting**: deploy `frontend/` to Vercel as usual; point your
  router's hotspot walled-garden / redirect at the deployed URL, and set the
  `/api` proxy target (in `vite.config.js`, or your hosting's rewrite rules)
  to your backend's real URL.
- **Secrets**: never commit `.env`. Use your host's environment variable
  settings for `MPESA_*` and `MIKROTIK_*` values in production.
