/**
 * GinaService — User Service v1.0
 * CRUD users, KYC workflow, wallets, referrals, tiers, preferences
 */
import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifyRateLimit from '@fastify/rate-limit'
import { createClient } from 'redis'
import { Pool } from 'pg'
import { randomUUID, createHmac } from 'crypto'

type UserTier = 'free' | 'starter' | 'pro' | 'enterprise'
type KycLevel = 0 | 1 | 2 | 3 | 4 | 5
type Currency = 'USD' | 'EUR' | 'SAR' | 'AED' | 'EGP' | 'GBP'

const CONFIG = {
  port: parseInt(process.env.PORT || '3002'),
  jwtSecret: process.env.JWT_SECRET || 'gina-user-secret',
  hmacSecret: process.env.HMAC_SECRET || 'gina-hmac-secret',
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'ginaservice',
    user: process.env.POSTGRES_USER || 'gina',
    password: process.env.POSTGRES_PASSWORD || 'gina_secret',
    max: 20,
  },
  redis: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
}

const db = new Pool(CONFIG.postgres)
const redis = createClient({ url: CONFIG.redis.url })

async function auditLog(userId: string, action: string, details: object, by: string, ip?: string) {
  const payload = JSON.stringify({ userId, action, details, by, ts: Date.now() })
  const sig = createHmac('sha256', CONFIG.hmacSecret).update(payload).digest('hex')
  await db.query(
    `INSERT INTO audit_logs (id,entity_type,entity_id,action,actor_id,details,ip_address,signature,created_at)
     VALUES ($1,'user',$2,$3,$4,$5,$6,$7,NOW())`,
    [randomUUID(), userId, action, by, JSON.stringify(details), ip, sig]
  ).catch(() => {})
}

async function buildApp() {
  const app = Fastify({ logger: true, genReqId: () => randomUUID(), trustProxy: true })
  await app.register(fastifyHelmet, { contentSecurityPolicy: false })
  await app.register(fastifyCors, { origin: '*', credentials: true })
  await app.register(fastifyRateLimit, { max: 200, timeWindow: '1 minute' })
  await app.register(fastifyJwt, { secret: CONFIG.jwtSecret })

  const auth = async (req: Parameters<typeof app.get>[1] extends (req: infer R, ...a: unknown[]) => unknown ? R : never, reply: Parameters<typeof app.get>[1] extends (r: unknown, reply: infer R, ...a: unknown[]) => unknown ? R : never) => {
    try { await req.jwtVerify() } catch { reply.status(401).send({ error: 'Unauthorized' }) }
  }

  // ── Health ──
  app.get('/health', async () => ({ status: 'healthy', service: 'user-service', ts: new Date().toISOString(), uptime: process.uptime() }))

  // ── Get me ──
  app.get('/api/v1/users/me', { preHandler: [auth] }, async (req) => {
    const { sub } = req.user as { sub: string }
    const cached = await redis.get(`user:${sub}`)
    if (cached) return JSON.parse(cached)
    const r = await db.query('SELECT * FROM users WHERE id=$1', [sub])
    if (!r.rows[0]) throw { statusCode: 404, message: 'User not found' }
    await redis.setEx(`user:${sub}`, 300, JSON.stringify(r.rows[0]))
    return r.rows[0]
  })

  // ── Update profile ──
  app.patch('/api/v1/users/me', { preHandler: [auth] }, async (req) => {
    const { sub } = req.user as { sub: string }
    const { fullName, language, currency, timezone } = req.body as { fullName?: string; language?: string; currency?: Currency; timezone?: string }
    const r = await db.query(
      `UPDATE users SET full_name=COALESCE($1,full_name), language=COALESCE($2,language),
       currency=COALESCE($3,currency), timezone=COALESCE($4,timezone), updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [fullName, language, currency, timezone, sub]
    )
    await redis.del(`user:${sub}`)
    await auditLog(sub, 'profile.updated', { fullName, language, currency }, sub, req.ip)
    return r.rows[0]
  })

  // ── Get wallets ──
  app.get('/api/v1/users/me/wallets', { preHandler: [auth] }, async (req) => {
    const { sub } = req.user as { sub: string }
    const r = await db.query('SELECT * FROM wallets WHERE user_id=$1 ORDER BY created_at ASC', [sub])
    return r.rows
  })

  // ── Create wallet ──
  app.post('/api/v1/users/me/wallets', { preHandler: [auth] }, async (req) => {
    const { sub } = req.user as { sub: string }
    const { currency } = req.body as { currency: Currency }
    const exists = await db.query('SELECT id FROM wallets WHERE user_id=$1 AND currency=$2', [sub, currency])
    if (exists.rows[0]) throw { statusCode: 409, message: `Wallet for ${currency} already exists` }
    const r = await db.query(
      `INSERT INTO wallets (id,user_id,currency,balance,frozen_balance,status,created_at,updated_at)
       VALUES ($1,$2,$3,0,0,'active',NOW(),NOW()) RETURNING *`,
      [randomUUID(), sub, currency]
    )
    await auditLog(sub, 'wallet.created', { currency }, sub)
    return r.rows[0]
  })

  // ── Submit KYC ──
  app.post('/api/v1/users/me/kyc', { preHandler: [auth] }, async (req) => {
    const { sub } = req.user as { sub: string }
    const { level, documents } = req.body as { level: KycLevel; documents: object[] }
    const r = await db.query(
      `INSERT INTO kyc_records (id,user_id,level,status,documents,submitted_at,created_at)
       VALUES ($1,$2,$3,'pending',$4,NOW(),NOW()) RETURNING *`,
      [randomUUID(), sub, level, JSON.stringify(documents)]
    )
    await db.query(`UPDATE users SET kyc_status='pending',updated_at=NOW() WHERE id=$1`, [sub])
    await redis.del(`user:${sub}`)
    await auditLog(sub, 'kyc.submitted', { level }, sub)
    return r.rows[0]
  })

  // ── Get activity ──
  app.get('/api/v1/users/me/activity', { preHandler: [auth] }, async (req) => {
    const { sub } = req.user as { sub: string }
    const { limit = '50' } = req.query as { limit?: string }
    const r = await db.query(
      'SELECT * FROM audit_logs WHERE entity_id=$1 AND entity_type=\'user\' ORDER BY created_at DESC LIMIT $2',
      [sub, parseInt(limit)]
    )
    return r.rows
  })

  // ── Referral stats ──
  app.get('/api/v1/users/me/referrals', { preHandler: [auth] }, async (req) => {
    const { sub } = req.user as { sub: string }
    const [user, referrals] = await Promise.all([
      db.query('SELECT referral_code, total_referrals FROM users WHERE id=$1', [sub]),
      db.query('SELECT id,full_name,created_at FROM users WHERE referred_by=$1 ORDER BY created_at DESC LIMIT 50', [sub]),
    ])
    const { referral_code, total_referrals } = user.rows[0] || {}
    return { referralCode: referral_code, totalReferrals: total_referrals || 0, totalEarned: (total_referrals || 0) * 10, referrals: referrals.rows }
  })

  // ── Search users ──
  app.get('/api/v1/users/search', { preHandler: [auth] }, async (req) => {
    const { q = '', limit = '20' } = req.query as { q?: string; limit?: string }
    const r = await db.query(
      `SELECT id,full_name,email,referral_code FROM users WHERE (email ILIKE $1 OR full_name ILIKE $1 OR referral_code ILIKE $1) AND is_active=true LIMIT $2`,
      [`%${q}%`, parseInt(limit)]
    )
    return r.rows
  })

  // ── Admin: list users ──
  app.get('/api/v1/admin/users', { preHandler: [auth] }, async (req) => {
    const { page = '1', limit = '20', tier } = req.query as { page?: string; limit?: string; tier?: UserTier }
    const offset = (parseInt(page) - 1) * parseInt(limit)
    const where = tier ? `WHERE tier='${tier}'` : ''
    const [rows, count] = await Promise.all([
      db.query(`SELECT * FROM users ${where} ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [parseInt(limit), offset]),
      db.query(`SELECT COUNT(*) FROM users ${where}`),
    ])
    return { users: rows.rows, total: parseInt(count.rows[0].count), page: parseInt(page), limit: parseInt(limit) }
  })

  // ── Admin: change tier ──
  app.patch('/api/v1/admin/users/:id/tier', { preHandler: [auth] }, async (req) => {
    const { id } = req.params as { id: string }
    const { tier } = req.body as { tier: UserTier }
    const { sub } = req.user as { sub: string }
    const r = await db.query(`UPDATE users SET tier=$1,updated_at=NOW() WHERE id=$2 RETURNING *`, [tier, id])
    await redis.del(`user:${id}`)
    await auditLog(id, 'tier.changed', { tier }, sub)
    return r.rows[0]
  })

  // ── Metrics ──
  app.get('/metrics', async () => {
    const [total, active, kycBreakdown] = await Promise.all([
      db.query('SELECT COUNT(*) FROM users'),
      db.query(`SELECT COUNT(*) FROM users WHERE is_active=true AND last_login_at>NOW()-INTERVAL '30 days'`),
      db.query('SELECT kyc_level,COUNT(*) FROM users GROUP BY kyc_level ORDER BY kyc_level'),
    ])
    return {
      users: {
        total: parseInt(total.rows[0].count),
        active30d: parseInt(active.rows[0].count),
        byKycLevel: Object.fromEntries(kycBreakdown.rows.map((r: { kyc_level: number; count: string }) => [`level_${r.kyc_level}`, parseInt(r.count)])),
      },
    }
  })

  app.setErrorHandler((err, req, reply) => {
    app.log.error(err)
    reply.status((err as { statusCode?: number }).statusCode || 500).send({ error: err.message, requestId: req.id })
  })

  return app
}

async function main() {
  await redis.connect()
  const app = await buildApp()
  await app.listen({ port: CONFIG.port, host: '0.0.0.0' })
  console.log(`🚀 User Service on :${CONFIG.port}`)
}

main().catch(e => { console.error(e); process.exit(1) })
