import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import {GINA_AST_WATERMARK, GinaYoinksSecurityGuard} from './gina_yoinks_guard.js'
import {processMcpJsonRpcMessage} from '../mcp_server.js'

test('Layer 4 (SEC-04 ARTI): allows legitimate external media URLs with Theta = 0.0', () => {
  const youtube = GinaYoinksSecurityGuard.validateAndSanitizeUrl('https://youtu.be/dQw4w9WgXcQ')
  assert.equal(youtube.valid, true)
  assert.equal(youtube.theta, 0.0)
  assert.equal(youtube.sanitizedUrl, 'https://youtu.be/dQw4w9WgXcQ')

  const xUrl = GinaYoinksSecurityGuard.validateAndSanitizeUrl('https://x.com/user/status/123456')
  assert.equal(xUrl.valid, true)
  assert.equal(xUrl.theta, 0.0)
})

test('Layer 4 (SEC-04 ARTI): blocks command injection payloads with Theta >= 0.85', () => {
  assert.throws(
    () => GinaYoinksSecurityGuard.validateAndSanitizeUrl('https://youtu.be/abc; rm -rf /'),
    /\[GINA-SEC-L4 QUARANTINE\] Threat score Theta=0\.95 >= 0\.85/,
  )
  assert.throws(
    () => GinaYoinksSecurityGuard.validateAndSanitizeUrl('https://youtu.be/abc --exec id'),
    /\[GINA-SEC-L4 QUARANTINE\] Threat score Theta=0\.95 >= 0\.85/,
  )
  assert.throws(
    () => GinaYoinksSecurityGuard.validateAndSanitizeUrl('file:///etc/passwd'),
    /\[GINA-SEC-L4 QUARANTINE\] Threat score Theta=0\.95 >= 0\.85/,
  )
})

test('Layer 4 (SEC-04 ARTI): blocks SSRF attempts against internal and sovereign networks', () => {
  const blockedUrls = [
    'http://127.0.0.1:3000/health',
    'http://localhost:6379/',
    'http://10.0.0.15/internal',
    'http://192.168.1.1/admin',
    'http://172.16.0.5/metrics',
    'https://bus.ginaservice.com/internal',
    'https://security.ginaservice.com/keys',
    'https://supreme.ginaservice.com/vault',
  ]

  for (const url of blockedUrls) {
    assert.throws(
      () => GinaYoinksSecurityGuard.validateAndSanitizeUrl(url),
      /\[GINA-SEC-L4 QUARANTINE\] SSRF attempt against internal sovereign network blocked/,
      `Expected SSRF block for ${url}`,
    )
  }
})

test('Layer 1, 2, 3, 5, 6, 7: verifies full 7-Layer GINA-SEC-7L-2026 compliance and WORM audit generation', () => {
  // Layer 1: FP_runtime & HMAC-SHA256
  const fp = GinaYoinksSecurityGuard.verifyRuntimeFingerprint('GINA-DIR5-MEDIA-001')
  assert.equal(fp.verified, true)
  assert.equal(fp.fpRuntime.length, 64)

  // Layer 2: 30s SIACP Ephemeral Session
  const siacp = GinaYoinksSecurityGuard.createSiacpEphemeralSession('GINA-DIR5-MEDIA-001')
  assert.equal(siacp.ttlSeconds, 30)
  assert.equal(siacp.expiresAt - siacp.issuedAt, 30)

  // Layer 3: Bell-LaPadula ("No Read Up") & Biba ("No Write Down")
  assert.equal(GinaYoinksSecurityGuard.enforceBellLaPadulaBiba('SEC-L1/TS-L1', 'SEC-L1/TS-L1', 'read'), true)
  assert.throws(
    () => GinaYoinksSecurityGuard.enforceBellLaPadulaBiba('SEC-L1/TS-L1', 'TS-L4', 'read'),
    /\[GINA-SEC-L3 BELL-LAPADULA\]/,
  )

  // Layer 5: Redis AST Semantic Lock
  const lock = GinaYoinksSecurityGuard.acquireAstSemanticLock()
  assert.equal(lock.lockKey, 'lock:repo:packages/gina-yoinks-media')
  assert.equal(lock.branch, 'agent/DEV-MEDIA/yoinks-integration')

  // Layer 6: Zero Secret Leakage (S_leak = 0.00, R_secret = 1.0)
  const {sanitizedEnv, sLeak, rSecret, rLegal} = GinaYoinksSecurityGuard.createSanitizedChildEnv({
    PATH: '/usr/bin',
    GINA_SECRET_KEY: 'super-secret',
    GINA_PATENT_30828_HMAC: 'patent-secret',
    JWT_SECRET: 'jwt-secret',
  })
  assert.equal(sLeak, 0.0)
  assert.equal(rSecret, 1.0)
  assert.equal(rLegal, 1.0)
  assert.equal(sanitizedEnv.PATH, '/usr/bin')
  assert.equal(sanitizedEnv.GINA_SECRET_KEY, undefined)
  assert.equal(sanitizedEnv.GINA_PATENT_30828_HMAC, undefined)
  assert.equal(sanitizedEnv.JWT_SECRET, undefined)
  assert.equal(GINA_AST_WATERMARK.leakageScoreSLeak, 0.0)

  // Layer 4 & Layer 7: Binary integrity & WORM Audit Record
  const tmpFile = path.join(os.tmpdir(), `yoinks-worm-test-${Date.now()}.mp4`)
  fs.writeFileSync(tmpFile, 'GINA-TEST-MEDIA-PAYLOAD-2026')
  try {
    const binCheck = GinaYoinksSecurityGuard.verifyBinaryIntegrity(tmpFile)
    assert.equal(binCheck.valid, true)
    assert.equal(binCheck.sha256.length, 64)

    const audit = GinaYoinksSecurityGuard.generateWormAuditRecord(
      tmpFile,
      'https://youtu.be/dQw4w9WgXcQ',
      'GINA-DIR5-MEDIA-001',
    )
    assert.match(audit.taskUuid, /^YOINKS-/)
    assert.equal(audit.agentId, 'GINA-DIR5-MEDIA-001')
    assert.equal(audit.clearance, 'SEC-L1/TS-L1')
    assert.equal(audit.outputFileHash, binCheck.sha256)
    assert.equal(audit.threatScoreTheta, 0.0)
    assert.equal(audit.leakageScoreSLeak, 0.0)
  } finally {
    fs.rmSync(tmpFile, {force: true})
  }
})

test('MCP Server: responds to initialize and tools/list with gina_yoink_media', async () => {
  const initRes = await processMcpJsonRpcMessage({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
  })
  assert.ok(initRes)
  assert.equal(initRes.id, 1)

  const listRes = (await processMcpJsonRpcMessage({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
  })) as {result: {tools: Array<{name: string}>}}
  assert.equal(listRes.result.tools[0]?.name, 'gina_yoink_media')
})
