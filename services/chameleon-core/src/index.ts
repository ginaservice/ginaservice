/**
 * GinaService — Chameleon Core v1.0
 * Adaptive skill engine: 5 modes (stealth, execution, defensive, learning, adaptive)
 * Skill registry, context routing, dependency resolution, feedback loop
 */
import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCors from '@fastify/cors'
import fastifyRateLimit from '@fastify/rate-limit'
import { createClient } from 'redis'
import { Pool } from 'pg'
import { randomUUID } from 'crypto'

type Mode = 'stealth' | 'execution' | 'defensive' | 'learning' | 'adaptive'
type SkillStatus = 'active' | 'inactive' | 'deprecated' | 'beta'
type Category = 'payment' | 'kyc' | 'security' | 'ml' | 'communication' | 'utility'

interface SkillCtx {
  execId: string; skillId: string; userId: string; mode: Mode
  input: Record<string, unknown>; state: Record<string, unknown>
  emit: (event: string, data: unknown) => void
  callSkill: (id: string, input: Record<string, unknown>) => Promise<unknown>
}

type SkillFn = (ctx: SkillCtx) => Promise<unknown>

interface Skill {
  id: string; name: string; description: string; version: string
  category: Category; status: SkillStatus; defaultMode: Mode
  fn: SkillFn; timeout: number; retryable: boolean
  totalExecs: number; successCount: number; failCount: number; avgMs: number
}

const CONFIG = {
  port: parseInt(process.env.PORT || '3006'),
  jwtSecret: process.env.JWT_SECRET || 'gina-chameleon-secret',
  postgres: { host: process.env.POSTGRES_HOST || 'localhost', port: 5432, database: 'ginaservice', user: 'gina', password: 'gina_secret', max: 10 },
  redis: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
}

const db = new Pool(CONFIG.postgres)
const redis = createClient({ url: CONFIG.redis.url })

// ─── Skill Registry ────────────────────────────────────────────────────────

const registry = new Map<string, Skill>()

function registerSkill(s: Omit<Skill, 'totalExecs' | 'successCount' | 'failCount' | 'avgMs'>) {
  registry.set(s.id, { ...s, totalExecs: 0, successCount: 0, failCount: 0, avgMs: 0 })
  console.log(`📦 Skill: ${s.id} [${s.defaultMode}]`)
}

// ─── Built-in Skills ────────────────────────────────────────────────────────

registerSkill({
  id: 'risk-analyzer', name: 'Risk Analyzer', description: 'Scores transaction risk 0-100', version: '1.0.0',
  category: 'security', status: 'active', defaultMode: 'defensive', timeout: 5000, retryable: true,
  fn: async (ctx) => {
    const { amount = 0 } = ctx.input as { amount: number }
    let score = 0
    if (Number(amount) > 10000) score += 30
    if ((ctx.state.recentFails as number) > 3) score += 40
    return { riskScore: score, level: score > 70 ? 'high' : score > 40 ? 'medium' : 'low', recommendation: score > 70 ? 'block' : 'allow' }
  },
})

registerSkill({
  id: 'smart-rate', name: 'Smart Rate Suggester', description: 'Suggests optimal payment method', version: '1.0.0',
  category: 'payment', status: 'active', defaultMode: 'adaptive', timeout: 2000, retryable: true,
  fn: async (ctx) => {
    const { amount = 0, method = 'card' } = ctx.input as { amount: number; method: string }
    const rates: Record<string, number> = { wallet: 0.005, card: 0.029, bank: 0.01, crypto: 0.015 }
    const rate = rates[method] || 0.02
    const fee = Number(amount) * rate
    const walletFee = Number(amount) * 0.005
    return { suggestedMethod: 'wallet', fee, walletFee, saving: fee - walletFee, total: Number(amount) + fee }
  },
})

registerSkill({
  id: 'kyc-verifier', name: 'KYC Document Verifier', description: 'AI-powered document verification', version: '1.0.0',
  category: 'kyc', status: 'active', defaultMode: 'execution', timeout: 30000, retryable: false,
  fn: async (ctx) => {
    const { documentType } = ctx.input as { documentType: string }
    ctx.emit('kyc.verification.started', { documentType })
    // Stub — production calls OCR API
    await new Promise(r => setTimeout(r, 100))
    return { verified: true, confidence: 0.95, extractedData: { name: 'John Doe', expiryDate: '2030-01-01' } }
  },
})

registerSkill({
  id: 'auto-categorize', name: 'Transaction Categorizer', description: 'Auto-categorizes transactions', version: '1.0.0',
  category: 'ml', status: 'active', defaultMode: 'adaptive', timeout: 3000, retryable: true,
  fn: async (ctx) => {
    const { description = '' } = ctx.input as { description: string }
    const lower = String(description).toLowerCase()
    let category = 'transfer'
    if (lower.match(/food|restaurant|cafe|مطعم/)) category = 'food'
    else if (lower.match(/uber|taxi|transport|نقل/)) category = 'transport'
    else if (lower.match(/salary|راتب/)) category = 'income'
    else if (lower.match(/amazon|shopping|تسوق/)) category = 'shopping'
    return { category, confidence: 0.85 }
  },
})

registerSkill({
  id: 'adaptive-notif', name: 'Adaptive Notification Router', description: 'Routes to optimal channel', version: '1.0.0',
  category: 'communication', status: 'active', defaultMode: 'learning', timeout: 1000, retryable: true,
  fn: async (ctx) => {
    const preferred = (ctx.state.preferredChannel as string) || 'in_app'
    return { channel: preferred, shouldSend: true }
  },
})

// ─── Mode Router ───────────────────────────────────────────────────────────

function routeMode(ctx: Record<string, unknown>): Mode {
  const { threatLevel = 0, complexity = 0, timeConstraint = 9999 } = ctx as { threatLevel?: number; complexity?: number; timeConstraint?: number }
  if (Number(threatLevel) > 0.7) return 'defensive'
  if (Number(complexity) > 0.8) return 'execution'
  if (Number(timeConstraint) < 1000) return 'stealth'
  return 'adaptive'
}

// ─── Execution Engine ─────────────────────────────────────────────────────

async function executeSkill(skillId: string, userId: string, input: Record<string, unknown>, modeOverride?: Mode): Promise<{ id: string; status: string; output?: unknown; error?: string; durationMs: number }> {
  const skill = registry.get(skillId)
  if (!skill) throw { statusCode: 404, message: `Skill not found: ${skillId}` }
  if (skill.status === 'inactive' || skill.status === 'deprecated') throw { statusCode: 400, message: `Skill ${skillId} is ${skill.status}` }

  const execId = randomUUID()
  const mode = modeOverride || skill.defaultMode
  const start = Date.now()

  // Load state
  const stateRaw = await redis.get(`chameleon:state:${userId}:${skillId}`)
  const state = stateRaw ? JSON.parse(stateRaw) : {}

  const ctx: SkillCtx = {
    execId, skillId, userId, mode, input, state,
    emit: (event, data) => redis.publish(`chameleon:${event}`, JSON.stringify({ execId, userId, data })).catch(() => {}),
    callSkill: async (id, inp) => {
      const r = await executeSkill(id, userId, inp, mode)
      return r.output
    },
  }

  let output: unknown; let error: string | undefined; let status = 'completed'
  try {
    output = await Promise.race([skill.fn(ctx), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), skill.timeout))])
    skill.successCount++
    const ms = Date.now() - start
    skill.avgMs = (skill.avgMs * (skill.successCount - 1) + ms) / skill.successCount
    if (Object.keys(state).length) await redis.setEx(`chameleon:state:${userId}:${skillId}`, 86400, JSON.stringify(state))
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
    status = error === 'timeout' ? 'timeout' : 'failed'
    skill.failCount++
  }

  skill.totalExecs++
  const durationMs = Date.now() - start

  await db.query(
    `INSERT INTO skill_executions (id,skill_id,user_id,mode,status,input,output,error,duration_ms,completed_at,created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW())`,
    [execId, skillId, userId, mode, status, JSON.stringify(input), JSON.stringify(output), error, durationMs]
  ).catch(() => {})

  return { id: execId, status, output, error, durationMs }
}

// ─── HTTP Routes ───────────────────────────────────────────────────────────

async function buildApp() {
  const app = Fastify({ logger: true, genReqId: () => randomUUID(), trustProxy: true })
  await app.register(fastifyCors, { origin: '*' })
  await app.register(fastifyRateLimit, { max: 300, timeWindow: '1 minute' })
  await app.register(fastifyJwt, { secret: CONFIG.jwtSecret })

  const auth = async (req: Parameters<typeof app.get>[1] extends (req: infer R, ...a: unknown[]) => unknown ? R : never, reply: Parameters<typeof app.get>[1] extends (r: unknown, reply: infer R, ...a: unknown[]) => unknown ? R : never) => {
    try { await req.jwtVerify() } catch { reply.status(401).send({ error: 'Unauthorized' }) }
  }

  app.get('/health', async () => ({ status: 'healthy', service: 'chameleon-core', skills: registry.size, ts: new Date().toISOString() }))

  app.get('/api/v1/skills', { preHandler: [auth] }, async (req) => {
    const { category, mode, status } = req.query as { category?: Category; mode?: Mode; status?: SkillStatus }
    let skills = Array.from(registry.values()).map(({ fn: _, ...s }) => s)
    if (category) skills = skills.filter(s => s.category === category)
    if (mode) skills = skills.filter(s => s.defaultMode === mode)
    if (status) skills = skills.filter(s => s.status === status)
    return skills
  })

  app.post('/api/v1/skills/:id/execute', { preHandler: [auth] }, async (req) => {
    const { id } = req.params as { id: string }
    const { sub } = req.user as { sub: string }
    const { input = {}, mode } = req.body as { input?: Record<string, unknown>; mode?: Mode }
    return executeSkill(id, sub, input, mode)
  })

  app.post('/api/v1/skills/route', { preHandler: [auth] }, async (req) => {
    const { context } = req.body as { context: Record<string, unknown> }
    return { recommendedMode: routeMode(context) }
  })

  app.get('/api/v1/skills/executions', { preHandler: [auth] }, async (req) => {
    const { sub } = req.user as { sub: string }
    const { limit = '50' } = req.query as { limit?: string }
    const r = await db.query('SELECT * FROM skill_executions WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2', [sub, parseInt(limit)])
    return r.rows
  })

  app.post('/api/v1/skills/executions/:id/feedback', { preHandler: [auth] }, async (req) => {
    const { id } = req.params as { id: string }
    const { sub } = req.user as { sub: string }
    const { rating, comment } = req.body as { rating: number; comment?: string }
    await db.query(`INSERT INTO skill_feedback (id,execution_id,user_id,rating,comment,created_at) VALUES ($1,$2,$3,$4,$5,NOW())`, [randomUUID(), id, sub, rating, comment]).catch(() => {})
    return { success: true }
  })

  app.get('/metrics', async () => ({
    skills: Object.fromEntries(Array.from(registry.entries()).map(([k, v]) => [k, { totalExecs: v.totalExecs, successCount: v.successCount, failCount: v.failCount, avgMs: Math.round(v.avgMs) }])),
  }))

  app.setErrorHandler((err, req, reply) => {
    reply.status((err as { statusCode?: number }).statusCode || 500).send({ error: err.message })
  })

  return app
}

async function main() {
  await redis.connect()
  const app = await buildApp()
  await app.listen({ port: CONFIG.port, host: '0.0.0.0' })
  console.log(`🚀 Chameleon Core on :${CONFIG.port}`)
}

main().catch(e => { console.error(e); process.exit(1) })
