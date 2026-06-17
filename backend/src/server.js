require('dotenv').config()
const express = require('express')
const cors = require('cors')

const paymentsRouter = require('./routes/payments')
const hotspotRouter = require('./routes/hotspot')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'betanet-backend' }))

app.use('/api/payments', paymentsRouter)
app.use('/api/hotspot', hotspotRouter)

// Fallback error handler so a thrown error never leaks a stack trace to the client.
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'Something went wrong. Please try again.' })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Betanet backend listening on port ${PORT}`)
})
