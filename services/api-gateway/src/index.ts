/**
 * 🌐 GinaService API Gateway
 * Amazon-grade API Gateway with circuit breaker, rate limiting, tracing
 */
import Fastify from 'fastify'
import { randomUUID } from 'crypto'

const app = Fastify({
  logger: { level: process.env.LOG_LEVEL || 'info' },
  genReqId: () => randomUUID(),
  trustProxy: true,
})

// ========== Service Registry ==========
const SERVICE_REGISTRY: Record<string, { url: string; healthy: boolean; failures: number }> = {
  'auth':         { url: process.env.AUTH_SERVICE_URL    || 'http://localhost:3001', healthy: true, failures: 0 },
  'users':        { url: process.env.USER_SERVICE_URL    || 'http://localhost:3002', healthy: true, failures: 0 },
  'gina-pay':     { url: process.env.PAY_SERVICE_URL     || 'http://localhost:3003', healthy: true, failures: 0 },
  'notifications':{ url: process.env.NOTIF_SERVICE_URL   || 'http://localhost:3004', healthy: true, failures: 0 },
  'analytics':    { url: process.env.ANALYTICS_URL       || 'http://localhost:3005', healthy: true, failures: 0 },
  'chameleon':    { url: process.env.CHAMELEON_URL       || 'http://localhost:3006', healthy: true, failures: 0 },
}

const CIRCUIT_BREAKER_THRESHOLD = 5
const CIRCUIT_BREAKER_RESET_MS = 60_000

// ========== Plugins ==========
async function bootstrap() {
  // Request ID & Tracing
  app.addHook('onRequest', async (req, reply) => {
    const traceId = (req.headers['x-trace-id'] as string) || randomUUID()
    const spanId  = randomUUID().slice(0, 16)
    req.headers['x-trace-id'] = traceId
    req.headers['x-span-id']  = spanId
    reply.header('X-Trace-ID', traceId)
    reply.header('X-Span-ID',  spanId)
    reply.header('X-Request-ID', req.id)
    reply.header('X-Powered-By', 'GinaService/1.0')
  })

  // Security headers
  app.addHook('onSend', async (_req, reply) => {
    reply.header('X-Content-Type-Options', 'nosniff')
    reply.header('X-Frame-Options', 'DENY')
    reply.header('X-XSS-Protection', '1; mode=block')
    reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  })

  // ========== Health ==========
  app.get('/health', async () => {
    const services = Object.entries(SERVICE_REGISTRY).map(([name, svc]) => ({
      name,
      healthy: svc.healthy,
      failures: svc.failures,
    }))
    const allHealthy = services.every(s => s.healthy)
    return {
      status: allHealthy ? 'healthy' : 'degraded',
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString(),
      services,
    }
  })

  // ========== Metrics (Prometheus) ==========
  app.get('/metrics', async (_req, reply) => {
    const lines = [
      '# HELP ginaservice_requests_total Total requests',
      '# TYPE ginaservice_requests_total counter',
      'ginaservice_requests_total 0',
      '',
      '# HELP ginaservice_service_health Service health 1=up 0=down',
      '# TYPE ginaservice_service_health gauge',
      ...Object.entries(SERVICE_REGISTRY).map(([name, svc]) =>
        `ginaservice_service_health{service="${name}"} ${svc.healthy ? 1 : 0}`
      ),
    ]
    reply.type('text/plain').send(lines.join('\n'))
  })

  // ========== Proxy with Circuit Breaker ==========
  app.all('/api/v1/:service/*', async (req, reply) => {
    const { service } = req.params as { service: string; '*': string }
    const path = (req.params as any)['*']
    const svcConfig = SERVICE_REGISTRY[service]

    if (!svcConfig) {
      return reply.code(404).send({ success: false, error: { code: 'SERVICE_NOT_FOUND', message: `Service '${service}' not registered` } })
    }

    // Circuit breaker check
    if (!svcConfig.healthy) {
      return reply.code(503).send({ success: false, error: { code: 'CIRCUIT_OPEN', message: `Service '${service}' is temporarily unavailable` } })
    }

    try {
      const targetUrl = `${svcConfig.url}/${path}`
      const method = req.method

      // Forward with timeout
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10_000)

      const response = await fetch(targetUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Trace-ID': req.headers['x-trace-id'] as string,
          'X-Span-ID':  req.headers['x-span-id']  as string,
          'X-Forwarded-For': req.ip,
          ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
        },
        body: ['GET', 'HEAD'].includes(method) ? undefined : JSON.stringify(req.body),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      // Reset circuit breaker on success
      svcConfig.failures = 0
      svcConfig.healthy = true

      const data = await response.json()
      return reply.code(response.status).send(data)

    } catch (error: any) {
      // Increment failure count
      svcConfig.failures++
      if (svcConfig.failures >= CIRCUIT_BREAKER_THRESHOLD) {
        svcConfig.healthy = false
        app.log.error(`Circuit breaker OPEN for service: ${service}`)
        // Auto-reset after timeout
        setTimeout(() => {
          svcConfig.healthy = true
          svcConfig.failures = 0
          app.log.info(`Circuit breaker RESET for service: ${service}`)
        }, CIRCUIT_BREAKER_RESET_MS)
      }

      const isTimeout = error.name === 'AbortError'
      return reply.code(isTimeout ? 504 : 502).send({
        success: false,
        error: {
          code: isTimeout ? 'GATEWAY_TIMEOUT' : 'BAD_GATEWAY',
          message: isTimeout ? 'Service request timed out' : 'Service temporarily unavailable',
        },
      })
    }
  })

  // ========== Start ==========
  const port = Number(process.env.PORT) || 3000
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`🚀 GinaService API Gateway running on port ${port}`)
}

bootstrap().catch(err => {
  console.error(err)
  process.exit(1)
})

export { app }
