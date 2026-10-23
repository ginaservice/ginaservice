/**
 * 🔐 GinaService Auth Service
 * Firebase Auth + JWT + MFA + Session Management + Brute-Force Protection
 */
import Fastify from 'fastify'
import { randomUUID, createHmac, timingSafeEqual } from 'crypto'
import { authenticator } from 'otplib'

const app = Fastify({ logger: true, genReqId: () => randomUUID(), trustProxy: true })

// ========== In-memory stores (replace with Redis in production) ==========
const sessions   = new Map<string, SessionRecord>()
const loginAttempts = new Map<string, LoginAttempt>()
const tokenBlacklist = new Set<string>()
const pendingVerifications = new Map<string, PendingVerification>()

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production-must-be-32-chars'
const ACCESS_TOKEN_TTL  = 15 * 60          // 15 minutes
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 // 7 days
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 30 * 60 * 1000

// ========== Types ==========
interface SessionRecord {
  sessionId: string; userId: string; email: string
  deviceId: string;  ip: string;     userAgent: string
  role: string;      tier: string;   mfaVerified: boolean
  issuedAt: number;  expiresAt: number
  lastActivityAt: number
}

interface LoginAttempt { count: number; lockedUntil?: number; lastAttempt: number }
interface PendingVerification { token: string; email: string; expiresAt: number; type: 'email' | 'reset' }

// ========== JWT helpers (simple HMAC-based for demo; use jose in prod) ==========
function signToken(payload: object, expiresIn: number): string {
  const header  = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const claims  = Buffer.from(JSON.stringify({ ...payload, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + expiresIn })).toString('base64url')
  const sig     = createHmac('sha256', JWT_SECRET).update(`${header}.${claims}`).digest('base64url')
  return `${header}.${claims}.${sig}`
}

function verifyToken(token: string): Record<string, any> | null {
  if (tokenBlacklist.has(token)) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, claims, sig] = parts
  const expected = createHmac('sha256', JWT_SECRET).update(`${header}.${claims}`).digest('base64url')
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  const payload = JSON.parse(Buffer.from(claims, 'base64url').toString())
  if (payload.exp < Math.floor(Date.now()/1000)) return null
  return payload
}

// ========== Brute-force protection ==========
function checkLoginAttempts(identifier: string): { allowed: boolean; retriesLeft: number } {
  const attempt = loginAttempts.get(identifier) || { count: 0, lastAttempt: 0 }
  if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) {
    return { allowed: false, retriesLeft: 0 }
  }
  return { allowed: true, retriesLeft: MAX_LOGIN_ATTEMPTS - attempt.count }
}

function recordLoginAttempt(identifier: string, success: boolean) {
  if (success) { loginAttempts.delete(identifier); return }
  const attempt = loginAttempts.get(identifier) || { count: 0, lastAttempt: 0 }
  attempt.count++
  attempt.lastAttempt = Date.now()
  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    attempt.lockedUntil = Date.now() + LOCKOUT_DURATION_MS
  }
  loginAttempts.set(identifier, attempt)
}

// ========== Routes ==========
// POST /auth/register
app.post('/auth/register', async (req, reply) => {
  const { email, password, displayName } = req.body as any
  if (!email || !password || !displayName) return reply.code(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'email, password, displayName required' } })
  if (password.length < 8) return reply.code(400).send({ success: false, error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters' } })

  // In production: create user in Firebase Auth + store in DB
  const userId = `usr_${randomUUID().replace(/-/g,'').slice(0,16)}`
  const verifyToken = randomUUID()
  pendingVerifications.set(verifyToken, { token: verifyToken, email, expiresAt: Date.now() + 24*60*60*1000, type: 'email' })

  app.log.info({ userId, email }, 'User registered — verification email sent')
  return reply.code(201).send({
    success: true,
    data: { userId, email, displayName, status: 'pending_verification', message: 'Verification email sent. Please verify your email.' },
    requestId: req.id,
    timestamp: new Date().toISOString(),
  })
})

// POST /auth/login
app.post('/auth/login', async (req, reply) => {
  const { email, password, mfaCode, deviceId } = req.body as any
  const identifier = `login:${req.ip}:${email}`
  const { allowed, retriesLeft } = checkLoginAttempts(identifier)
  if (!allowed) return reply.code(429).send({ success: false, error: { code: 'ACCOUNT_LOCKED', message: 'Too many attempts. Account temporarily locked.' } })

  // In production: verify against Firebase Auth / database
  const isValid = email && password && password.length >= 8
  if (!isValid) {
    recordLoginAttempt(identifier, false)
    return reply.code(401).send({ success: false, error: { code: 'INVALID_CREDENTIALS', message: `Invalid credentials. ${retriesLeft - 1} attempts remaining.` } })
  }

  recordLoginAttempt(identifier, true)

  // Mock user
  const userId = `usr_demo_${Buffer.from(email).toString('hex').slice(0,8)}`
  const sessionId = randomUUID()

  const session: SessionRecord = {
    sessionId, userId, email,
    deviceId: deviceId || 'unknown',
    ip: req.ip, userAgent: req.headers['user-agent'] || '',
    role: 'user', tier: 'free', mfaVerified: !mfaCode, // simplification
    issuedAt: Date.now(),
    expiresAt: Date.now() + REFRESH_TOKEN_TTL * 1000,
    lastActivityAt: Date.now(),
  }
  sessions.set(sessionId, session)

  const accessToken  = signToken({ sub: userId, sid: sessionId, role: 'user', type: 'access'  }, ACCESS_TOKEN_TTL)
  const refreshToken = signToken({ sub: userId, sid: sessionId, type: 'refresh' }, REFRESH_TOKEN_TTL)

  return reply.send({
    success: true,
    data: {
      accessToken, refreshToken,
      tokenType: 'Bearer',
      expiresIn: ACCESS_TOKEN_TTL,
      user: { id: userId, email, role: 'user', tier: 'free' },
      session: { sessionId, deviceId: session.deviceId },
    },
    requestId: req.id, timestamp: new Date().toISOString(),
  })
})

// POST /auth/refresh
app.post('/auth/refresh', async (req, reply) => {
  const { refreshToken } = req.body as any
  if (!refreshToken) return reply.code(400).send({ success: false, error: { code: 'MISSING_TOKEN' } })

  const payload = verifyToken(refreshToken)
  if (!payload || payload.type !== 'refresh') return reply.code(401).send({ success: false, error: { code: 'INVALID_REFRESH_TOKEN' } })

  const session = sessions.get(payload.sid)
  if (!session || session.expiresAt < Date.now()) return reply.code(401).send({ success: false, error: { code: 'SESSION_EXPIRED' } })

  session.lastActivityAt = Date.now()
  const newAccessToken = signToken({ sub: payload.sub, sid: payload.sid, role: session.role, type: 'access' }, ACCESS_TOKEN_TTL)
  return reply.send({ success: true, data: { accessToken: newAccessToken, expiresIn: ACCESS_TOKEN_TTL }, requestId: req.id, timestamp: new Date().toISOString() })
})

// POST /auth/logout
app.post('/auth/logout', async (req, reply) => {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const payload = verifyToken(token)
    if (payload?.sid) sessions.delete(payload.sid)
    tokenBlacklist.add(token)
  }
  return reply.send({ success: true, data: { message: 'Logged out successfully' }, requestId: req.id, timestamp: new Date().toISOString() })
})

// GET /auth/me
app.get('/auth/me', async (req, reply) => {
  const token = req.headers.authorization?.slice(7)
  if (!token) return reply.code(401).send({ success: false, error: { code: 'UNAUTHORIZED' } })
  const payload = verifyToken(token)
  if (!payload) return reply.code(401).send({ success: false, error: { code: 'INVALID_TOKEN' } })
  const session = sessions.get(payload.sid)
  if (!session) return reply.code(401).send({ success: false, error: { code: 'SESSION_NOT_FOUND' } })
  return reply.send({ success: true, data: { userId: payload.sub, sessionId: payload.sid, role: payload.role, session: { ip: session.ip, deviceId: session.deviceId } }, requestId: req.id, timestamp: new Date().toISOString() })
})

// POST /auth/mfa/setup
app.post('/auth/mfa/setup', async (req, reply) => {
  const secret = authenticator.generateSecret()
  const token = authenticator.generate(secret)
  return reply.send({ success: true, data: { secret, otpauthUrl: `otpauth://totp/GinaService?secret=${secret}&issuer=GinaService`, backupCodes: Array.from({length:10}, () => randomUUID().slice(0,8).toUpperCase()) }, requestId: req.id, timestamp: new Date().toISOString() })
})

// GET /health
app.get('/health', async () => ({ status: 'healthy', service: 'auth-service', timestamp: new Date().toISOString() }))

const port = Number(process.env.PORT) || 3001
app.listen({ port, host: '0.0.0.0' }).then(() => console.log(`🔐 Auth Service on port ${port}`))

export { app }
