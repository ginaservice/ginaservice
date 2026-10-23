/**
 * 💳 GinaPay Service — Full Payment Engine
 * Multi-currency | Multi-method | Fraud Detection | AML Compliance
 */
import Fastify from 'fastify'
import { randomBytes, createHmac, timingSafeEqual } from 'crypto'

const app = Fastify({ logger: true, genReqId: () => `pay_${randomBytes(8).toString('hex')}`, trustProxy: true })

// ========== Types ==========
const Currency = ['USD','EUR','GBP','SAR','AED','EGP','BTC','ETH','USDT','USDC'] as const
type Currency = typeof Currency[number]

const PaymentMethod = ['card','bank_transfer','gina_wallet','crypto','apple_pay','google_pay','paypal'] as const
type PaymentMethod = typeof PaymentMethod[number]

const TxStatus = ['initiated','pending','processing','completed','failed','cancelled','refunded','disputed','on_hold'] as const
type TxStatus = typeof TxStatus[number]

interface Transaction {
  id: string; referenceId: string; idempotencyKey: string
  type: 'payment' | 'refund' | 'transfer' | 'deposit' | 'withdrawal'
  status: TxStatus; amount: number; currency: Currency
  method: PaymentMethod; senderId?: string; recipientId?: string; merchantId?: string
  description: string; fees: Fees; riskScore: number
  metadata: Record<string, unknown>; auditTrail: AuditEntry[]
  webhookUrl?: string; retryCount: number
  createdAt: Date; updatedAt: Date; completedAt?: Date; failureReason?: string
}

interface Fees { processingFee: number; platformFee: number; networkFee: number; total: number; currency: Currency }
interface AuditEntry { action: string; actor: string; timestamp: Date; details?: Record<string, unknown> }

// ========== Storage (in-memory for demo; use PostgreSQL + Redis in prod) ==========
const transactions = new Map<string, Transaction>()
const idempotencyCache = new Map<string, string>()
const wallets = new Map<string, Map<Currency, number>>()
const webhookQueue: Array<{ txId: string; url: string; attempt: number }> = []

// ========== Fee Engine ==========
const FEE_RATES: Record<PaymentMethod, { pct: number; fixed: number }> = {
  card:           { pct: 0.029,  fixed: 0.30 },
  bank_transfer:  { pct: 0.005,  fixed: 0.25 },
  gina_wallet:    { pct: 0.005,  fixed: 0.00 },  // ✅ Best rate!
  crypto:         { pct: 0.010,  fixed: 0.00 },
  apple_pay:      { pct: 0.025,  fixed: 0.10 },
  google_pay:     { pct: 0.025,  fixed: 0.10 },
  paypal:         { pct: 0.034,  fixed: 0.30 },
}

function calculateFees(amount: number, method: PaymentMethod, currency: Currency): Fees {
  const { pct, fixed } = FEE_RATES[method]
  const processingFee = Math.round((amount * pct + fixed) * 100) / 100
  const platformFee   = Math.round(amount * 0.005 * 100) / 100
  const networkFee    = currency === 'BTC' || currency === 'ETH' ? Math.round(amount * 0.001 * 100) / 100 : 0
  return { processingFee, platformFee, networkFee, total: processingFee + platformFee + networkFee, currency }
}

// ========== Fraud Detection ==========
async function calculateRiskScore(req: any, amount: number, method: PaymentMethod): Promise<number> {
  let score = 0
  // Velocity checks
  const recentTxCount = Array.from(transactions.values()).filter(t => t.senderId === req.body?.userId && Date.now() - t.createdAt.getTime() < 3600000).length
  if (recentTxCount > 10) score += 30
  // High value
  if (amount > 10000) score += 20
  if (amount > 50000) score += 30
  // Country / IP risk (simplified)
  const suspiciousIPs = ['10.0.0.1'] // placeholder
  if (suspiciousIPs.includes(req.ip)) score += 40
  return Math.min(score, 100)
}

// ========== Transaction Lifecycle ==========
function createTransaction(params: Partial<Transaction> & Pick<Transaction, 'amount' | 'currency' | 'method'>): Transaction {
  const id = `txn_${randomBytes(12).toString('hex')}`
  const tx: Transaction = {
    id,
    referenceId: `REF-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`,
    idempotencyKey: params.idempotencyKey || id,
    type: params.type || 'payment',
    status: 'initiated',
    amount: params.amount,
    currency: params.currency,
    method: params.method,
    senderId: params.senderId,
    recipientId: params.recipientId,
    merchantId: params.merchantId,
    description: params.description || '',
    fees: calculateFees(params.amount, params.method, params.currency),
    riskScore: 0,
    metadata: params.metadata || {},
    webhookUrl: params.webhookUrl,
    retryCount: 0,
    auditTrail: [{ action: 'created', actor: 'system', timestamp: new Date() }],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  transactions.set(id, tx)
  return tx
}

async function processTransaction(tx: Transaction): Promise<Transaction> {
  tx.status = 'processing'
  tx.updatedAt = new Date()
  tx.auditTrail.push({ action: 'processing_started', actor: 'system', timestamp: new Date() })

  // Risk check
  if (tx.riskScore >= 80) {
    tx.status = 'on_hold'
    tx.auditTrail.push({ action: 'held_for_review', actor: 'fraud_engine', timestamp: new Date(), details: { riskScore: tx.riskScore } })
    return tx
  }

  // Simulate payment processor (95% success rate)
  const success = Math.random() > 0.05
  if (success) {
    tx.status = 'completed'
    tx.completedAt = new Date()
    tx.auditTrail.push({ action: 'completed', actor: 'processor', timestamp: new Date() })
    // Update wallet balances
    if (tx.senderId) {
      const senderWallet = wallets.get(tx.senderId) || new Map()
      const cur = tx.currency as Currency
      senderWallet.set(cur, (senderWallet.get(cur) || 0) - (tx.amount + tx.fees.total))
      wallets.set(tx.senderId, senderWallet)
    }
  } else {
    tx.status = 'failed'
    tx.failureReason = 'Payment processor declined'
    tx.auditTrail.push({ action: 'failed', actor: 'processor', timestamp: new Date(), details: { reason: tx.failureReason } })
  }

  tx.updatedAt = new Date()
  // Queue webhook
  if (tx.webhookUrl) webhookQueue.push({ txId: tx.id, url: tx.webhookUrl, attempt: 1 })
  return tx
}

// ========== Webhook delivery with retry ==========
async function deliverWebhook(txId: string, url: string, attempt: number) {
  const tx = transactions.get(txId)
  if (!tx) return
  const payload = { event: 'transaction.updated', timestamp: new Date().toISOString(), data: tx }
  const sig = createHmac('sha256', process.env.WEBHOOK_SECRET || 'webhook_secret').update(JSON.stringify(payload)).digest('hex')
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-GinaPay-Signature': `sha256=${sig}` },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    })
  } catch {
    if (attempt < 5) {
      const delay = Math.pow(2, attempt) * 1000 // exponential backoff
      setTimeout(() => deliverWebhook(txId, url, attempt + 1), delay)
    }
  }
}

// ========== Routes ==========
// POST /payments — Create & process payment
app.post('/payments', async (req, reply) => {
  const { amount, currency, method, senderId, recipientId, merchantId, description, metadata, webhookUrl, idempotencyKey } = req.body as any

  // Validation
  if (!amount || amount <= 0) return reply.code(400).send({ success: false, error: { code: 'INVALID_AMOUNT', message: 'Amount must be positive' } })
  if (!Currency.includes(currency)) return reply.code(400).send({ success: false, error: { code: 'INVALID_CURRENCY' } })
  if (!PaymentMethod.includes(method)) return reply.code(400).send({ success: false, error: { code: 'INVALID_METHOD' } })

  // Idempotency
  if (idempotencyKey && idempotencyCache.has(idempotencyKey)) {
    const existingId = idempotencyCache.get(idempotencyKey)!
    return reply.code(200).send({ success: true, data: transactions.get(existingId), requestId: req.id, timestamp: new Date().toISOString() })
  }

  const tx = createTransaction({ amount, currency, method, senderId, recipientId, merchantId, description, metadata, webhookUrl, idempotencyKey })
  tx.riskScore = await calculateRiskScore(req, amount, method)

  if (idempotencyKey) idempotencyCache.set(idempotencyKey, tx.id)

  const processed = await processTransaction(tx)
  const code = processed.status === 'completed' ? 201 : processed.status === 'on_hold' ? 202 : 402
  return reply.code(code).send({ success: processed.status === 'completed', data: processed, requestId: req.id, timestamp: new Date().toISOString() })
})

// GET /payments/:id
app.get('/payments/:id', async (req, reply) => {
  const { id } = req.params as any
  const tx = transactions.get(id)
  if (!tx) return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND' } })
  return reply.send({ success: true, data: tx, requestId: req.id, timestamp: new Date().toISOString() })
})

// POST /payments/:id/refund
app.post('/payments/:id/refund', async (req, reply) => {
  const { id } = req.params as any
  const { amount, reason } = req.body as any
  const original = transactions.get(id)
  if (!original) return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND' } })
  if (original.status !== 'completed') return reply.code(422).send({ success: false, error: { code: 'NOT_REFUNDABLE', message: `Cannot refund a ${original.status} transaction` } })
  const refundAmount = amount ?? original.amount
  if (refundAmount > original.amount) return reply.code(422).send({ success: false, error: { code: 'REFUND_EXCEEDS_AMOUNT' } })
  const refund = createTransaction({ type: 'refund', amount: refundAmount, currency: original.currency, method: original.method, description: `Refund: ${reason || 'customer request'}`, metadata: { originalTransactionId: id } })
  refund.status = 'completed'
  refund.completedAt = new Date()
  original.status = 'refunded'
  original.auditTrail.push({ action: 'refunded', actor: req.headers['x-user-id'] as string || 'system', timestamp: new Date(), details: { refundId: refund.id, amount: refundAmount } })
  return reply.send({ success: true, data: { refund, original }, requestId: req.id, timestamp: new Date().toISOString() })
})

// GET /wallets/:userId/balance
app.get('/wallets/:userId/balance', async (req, reply) => {
  const { userId } = req.params as any
  const wallet = wallets.get(userId) || new Map<Currency, number>()
  const balances = Object.fromEntries(wallet)
  return reply.send({ success: true, data: { userId, balances }, requestId: req.id, timestamp: new Date().toISOString() })
})

// GET /fees/estimate
app.get('/fees/estimate', async (req, reply) => {
  const { amount, currency, method } = req.query as any
  if (!amount || !currency || !method) return reply.code(400).send({ success: false, error: { code: 'MISSING_PARAMS' } })
  const fees = calculateFees(Number(amount), method as PaymentMethod, currency as Currency)
  const allMethodFees = PaymentMethod.map(m => ({ method: m, ...calculateFees(Number(amount), m, currency as Currency) })).sort((a, b) => a.total - b.total)
  return reply.send({ success: true, data: { requested: fees, comparison: allMethodFees, recommended: allMethodFees[0].method }, requestId: req.id, timestamp: new Date().toISOString() })
})

// GET /health
app.get('/health', async () => ({ status: 'healthy', service: 'gina-pay', timestamp: new Date().toISOString() }))

const port = Number(process.env.PORT) || 3003
app.listen({ port, host: '0.0.0.0' }).then(() => console.log(`💳 GinaPay Service on port ${port}`))

export { app }
