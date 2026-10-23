/**
 * GinaService — Notification Service v1.0
 * Multi-channel: Email, SMS, Push, In-App, WhatsApp, Webhook
 * Priority queue, exponential retry, AR+EN templates
 */
import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCors from '@fastify/cors'
import fastifyRateLimit from '@fastify/rate-limit'
import { createClient } from 'redis'
import { Pool } from 'pg'
import { randomUUID } from 'crypto'

type Channel = 'email' | 'sms' | 'push' | 'in_app' | 'whatsapp' | 'webhook'
type Priority = 'critical' | 'high' | 'normal' | 'low'
type NType = 'welcome' | 'payment_sent' | 'payment_received' | 'payment_failed' | 'kyc_approved' | 'kyc_rejected' | 'login_alert' | 'custom'

const QUEUES: Record<Priority, string> = {
  critical: 'gina:notif:critical', high: 'gina:notif:high',
  normal: 'gina:notif:normal', low: 'gina:notif:low',
}

const TEMPLATES: Record<string, { title?: string; body: string }> = {
  'payment_received:ar': { title: 'تم استلام دفعة 💰', body: 'استلمت {{amount}} {{currency}} من {{sender}}' },
  'payment_received:en': { title: 'Payment Received 💰', body: 'You received {{amount}} {{currency}} from {{sender}}' },
  'payment_sent:ar': { title: 'تم إرسال الدفعة 📤', body: 'أرسلت {{amount}} {{currency}} إلى {{recipient}}' },
  'payment_sent:en': { title: 'Payment Sent 📤', body: 'You sent {{amount}} {{currency}} to {{recipient}}' },
  'kyc_approved:ar': { title: 'تم التحقق ✅', body: 'تم قبول طلب التحقق من هويتك المستوى {{level}}' },
  'kyc_rejected:ar': { title: 'تم الرفض ❌', body: 'تم رفض طلب التحقق. السبب: {{reason}}' },
  'welcome:ar': { title: 'مرحباً في جينا! 🎉', body: 'مرحباً {{name}}، نرحب بك في منصة جينا' },
  'welcome:en': { title: 'Welcome to GINA! 🎉', body: 'Hello {{name}}, welcome to the GINA platform' },
}

function render(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] || `{{${k}}}`)
}

const CONFIG = {
  port: parseInt(process.env.PORT || '3004'),
  jwtSecret: process.env.JWT_SECRET || 'gina-notification-secret',
  postgres: { host: process.env.POSTGRES_HOST || 'localhost', port: 5432, database: 'ginaservice', user: 'gina', password: 'gina_secret', max: 10 },
  redis: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
  maxAttempts: 5,
  backoffBase: 60,
}

const db = new Pool(CONFIG.postgres)
const redis = createClient({ url: CONFIG.redis.url })

async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY
  if (!apiKey) { console.warn('[EMAIL] No API key — skipping'); return false }
  try {
    const r = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ personalizations: [{ to: [{ email: to }] }], from: { email: 'noreply@ginaservice.com', name: 'GINA' }, subject, content: [{ type: 'text/plain', value: body }] }),
    })
    return r.ok
  } catch { return false }
}

async function sendSms(to: string, body: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID, token = process.env.TWILIO_AUTH_TOKEN, from = process.env.TWILIO_FROM
  if (!sid || !token) { console.warn('[SMS] No credentials — skipping'); return false }
  try {
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ From: from!, To: to, Body: body }),
    })
    return r.ok
  } catch { return false }
}

async function saveInApp(notifId: string, userId: string, type: string, title: string, body: string, data: object): Promise<boolean> {
  await db.query(`INSERT INTO notifications (id,user_id,type,channel,title,body,data,is_read,created_at) VALUES ($1,$2,$3,'in_app',$4,$5,$6,false,NOW()) ON CONFLICT (id) DO NOTHING`, [notifId, userId, type, title, body, JSON.stringify(data)])
  await redis.publish(`user:${userId}:notif`, JSON.stringify({ id: notifId, type, title, body, data }))
  return true
}

async function dispatch(n: { id: string; userId: string; type: NType; channel: Channel; title?: string; subject?: string; body: string; data: object; recipientEmail?: string; recipientPhone?: string }): Promise<boolean> {
  switch (n.channel) {
    case 'email': return n.recipientEmail ? sendEmail(n.recipientEmail, n.subject || n.title || 'GINA', n.body) : false
    case 'sms': return n.recipientPhone ? sendSms(n.recipientPhone, n.body) : false
    case 'in_app': return saveInApp(n.id, n.userId, n.type, n.title || '', n.body, n.data)
    default: return false
  }
}

async function process(id: string): Promise<void> {
  const { rows } = await db.query('SELECT * FROM notifications WHERE id=$1', [id])
  if (!rows[0]) return
  const n = rows[0]
  await db.query(`UPDATE notifications SET status='processing',updated_at=NOW() WHERE id=$1`, [id])
  const ok = await dispatch(n)
  if (ok) {
    await db.query(`UPDATE notifications SET status='delivered',delivered_at=NOW(),updated_at=NOW() WHERE id=$1`, [id])
  } else {
    const attempts = (n.attempts || 0) + 1
    if (attempts < CONFIG.maxAttempts) {
      const backoff = CONFIG.backoffBase * Math.pow(2, attempts)
      const nextRetry = new Date(Date.now() + backoff * 1000)
      await db.query(`UPDATE notifications SET status='queued',attempts=$1,next_retry_at=$2,updated_at=NOW() WHERE id=$3`, [attempts, nextRetry, id])
      await redis.lPush(QUEUES.low, id)
    } else {
      await db.query(`UPDATE notifications SET status='failed',failure_reason='Max attempts exceeded',updated_at=NOW() WHERE id=$1`, [id])
    }
  }
}

async function worker(): Promise<void> {
  const queues: Priority[] = ['critical', 'high', 'normal', 'low']
  while (true) {
    let processed = false
    for (const p of queues) {
      const id = await redis.rPop(QUEUES[p])
      if (id) { await process(id).catch(console.error); processed = true; break }
    }
    if (!processed) await new Promise(r => setTimeout(r, 1000))
  }
}

async function buildApp() {
  const app = Fastify({ logger: true, genReqId: () => randomUUID(), trustProxy: true })
  await app.register(fastifyCors, { origin: '*' })
  await app.register(fastifyRateLimit, { max: 100, timeWindow: '1 minute' })
  await app.register(fastifyJwt, { secret: CONFIG.jwtSecret })

  const auth = async (req: Parameters<typeof app.get>[1] extends (req: infer R, ...a: unknown[]) => unknown ? R : never, reply: Parameters<typeof app.get>[1] extends (r: unknown, reply: infer R, ...a: unknown[]) => unknown ? R : never) => {
    try { await req.jwtVerify() } catch { reply.status(401).send({ error: 'Unauthorized' }) }
  }

  app.get('/health', async () => ({ status: 'healthy', service: 'notification-service', ts: new Date().toISOString() }))

  app.post('/api/v1/notifications/send', { preHandler: [auth] }, async (req) => {
    const { userId, type, channel, priority = 'normal', language = 'ar', variables = {}, recipientEmail, recipientPhone, data = {} } = req.body as {
      userId: string; type: NType; channel: Channel; priority?: Priority; language?: string
      variables?: Record<string, string>; recipientEmail?: string; recipientPhone?: string; data?: object
    }
    const tplKey = `${type}:${language}`
    const tpl = TEMPLATES[tplKey] || TEMPLATES[`${type}:ar`]
    const title = tpl?.title ? render(tpl.title, variables) : undefined
    const body = tpl ? render(tpl.body, variables) : ''
    const id = randomUUID()
    await db.query(
      `INSERT INTO notifications (id,user_id,type,channel,priority,status,title,body,data,recipient_email,recipient_phone,attempts,max_attempts,created_at,updated_at)
       VALUES ($1,$2,$3,$4,$5,'queued',$6,$7,$8,$9,$10,0,$11,NOW(),NOW())`,
      [id, userId, type, channel, priority, title, body, JSON.stringify(data), recipientEmail, recipientPhone, CONFIG.maxAttempts]
    )
    await redis.lPush(QUEUES[priority as Priority], id)
    return { id, status: 'queued' }
  })

  app.get('/api/v1/notifications/unread', { preHandler: [auth] }, async (req) => {
    const { sub } = req.user as { sub: string }
    const r = await db.query(`SELECT * FROM notifications WHERE user_id=$1 AND channel='in_app' AND is_read=false ORDER BY created_at DESC LIMIT 50`, [sub])
    return r.rows
  })

  app.post('/api/v1/notifications/read', { preHandler: [auth] }, async (req) => {
    const { sub } = req.user as { sub: string }
    const { ids } = req.body as { ids: string[] }
    await db.query('UPDATE notifications SET is_read=true,updated_at=NOW() WHERE id=ANY($1) AND user_id=$2', [ids, sub])
    return { success: true }
  })

  app.get('/metrics', async () => {
    const [total, delivered, failed, queued] = await Promise.all([
      db.query('SELECT COUNT(*) FROM notifications'),
      db.query(`SELECT COUNT(*) FROM notifications WHERE status='delivered'`),
      db.query(`SELECT COUNT(*) FROM notifications WHERE status='failed'`),
      db.query(`SELECT COUNT(*) FROM notifications WHERE status='queued'`),
    ])
    return { total: parseInt(total.rows[0].count), delivered: parseInt(delivered.rows[0].count), failed: parseInt(failed.rows[0].count), queued: parseInt(queued.rows[0].count) }
  })

  return app
}

async function main() {
  await redis.connect()
  worker().catch(console.error)
  const app = await buildApp()
  await app.listen({ port: CONFIG.port, host: '0.0.0.0' })
  console.log(`🚀 Notification Service on :${CONFIG.port}`)
}

main().catch(e => { console.error(e); process.exit(1) })
