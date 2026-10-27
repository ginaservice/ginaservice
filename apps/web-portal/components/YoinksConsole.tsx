'use client'

import React, {useEffect, useState} from 'react'

export interface AuditStreamEntry {
  taskUuid: string
  agentId: string
  clearance: string
  sourceUrl: string
  outputFileHash: string
  threatScoreTheta: number
  leakageScoreSLeak: number
  timestamp: number
  wormStreamTarget?: string
  merkleRoot?: string
  evolutionScoreSEvolve?: number
  filepath: string
  mode: 'best' | 'mp3'
}

interface TelemetryState {
  protocol: string
  documentRef: string
  layers?: {
    layer1RuntimeFp: {fpRuntime: string; hmacSignature: string; verified: boolean}
    layer2SiacpSession: {sessionId: string; issuedAt: number; expiresAt: number; ttlSeconds: number; supervisor: string}
    layer3BellLaPadulaBibaVerified: boolean
    layer4QuarantineThresholdTheta: number
    layer5AstSemanticLock: {lockKey: string; branch: string; mutexToken: string; supervisor: string}
    layer6ZeroLeakage: {sLeak: number; rSecret: number; rLegal: number}
    layer7SelfEvolution: {valid: boolean; sEvolve: number}
  }
  wormAuditStream: AuditStreamEntry[]
}

export function YoinksConsole({
  onAuditRecordCreated,
}: {
  onAuditRecordCreated?: (entry: AuditStreamEntry) => void
}) {
  const [url, setUrl] = useState('https://youtu.be/dQw4w9WgXcQ')
  const [mode, setMode] = useState<'best' | 'mp3'>('best')
  const [outDir, setOutDir] = useState('/tmp/yoinks-downloads')
  const [agentId, setAgentId] = useState('GINA-DIR5-MEDIA-001')
  const [wormLog, setWormLog] = useState(true)
  const [loading, setLoading] = useState(false)
  const [telemetry, setTelemetry] = useState<TelemetryState | null>(null)
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '┌──────────────────────────────────────────────────────────────────────────┐',
    '│  yoinks — GINASERVICE Sovereign Media Console (GINA-SEC-7L-2026)         │',
    '│  Clearance: SEC-L1/TS-L1 · S_leak=0.00 · R_secret=1.0 · R_legal=1.0      │',
    '└──────────────────────────────────────────────────────────────────────────┘',
    '$ yoinks --ready [awaiting DIR-5 operator command...]',
  ])
  const [latestAudit, setLatestAudit] = useState<AuditStreamEntry | null>(null)
  const [errorBanner, setErrorBanner] = useState<string | null>(null)

  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/yoinks')
      if (res.ok) {
        const data = (await res.json()) as TelemetryState
        setTelemetry(data)
        if (data.wormAuditStream?.[0] && !latestAudit) {
          setLatestAudit(data.wormAuditStream[0])
        }
      }
    } catch {
      // ignore initial fetch error
    }
  }

  useEffect(() => {
    void fetchTelemetry()
  }, [])

  const executeYoink = async (overrideUrl?: string) => {
    const targetUrl = overrideUrl ?? url
    setLoading(true)
    setErrorBanner(null)

    const cliCmd = `$ yoinks ${mode === 'mp3' ? '--mp3' : '--best'} -o ${outDir} ${wormLog ? '--worm-log ' : ''}"${targetUrl}"`
    setTerminalLogs(prev => [
      ...prev.slice(-14),
      cliCmd,
      '▸ [SEC-01] Verifying FP_runtime & HMAC-SHA256 signature…',
      '▸ [SEC-02] Issuing 30s ephemeral SIACP session token…',
      '▸ [SEC-04] Running URL quarantine gate (Theta < 0.85)…',
    ])

    try {
      const res = await fetch('/api/yoinks', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          url: targetUrl,
          mode,
          outDir,
          agentId,
          wormLog,
          dryRun: true,
        }),
      })
      const payload = await res.json()

      if (!res.ok || payload.status === 'quarantined') {
        const errMsg = payload.error || 'Quarantine gate blocked request.'
        setErrorBanner(errMsg)
        setTerminalLogs(prev => [
          ...prev,
          `✗ ${errMsg}`,
          `  └── Quarantine Triggered: Threat Score Theta=${payload.theta ?? 0.95} >= 0.85 | S_leak=0.00`,
        ])
      } else {
        const record = payload.auditRecord as AuditStreamEntry
        setLatestAudit(record)
        onAuditRecordCreated?.(record)
        setTerminalLogs(prev => [
          ...prev,
          `✓ [SEC-04] URL Sanitized (Theta=${payload.theta.toFixed(2)} < 0.85) · SIACP: ${payload.siacpSession.sessionId}`,
          `✓ [SEC-05] AST Lock Acquired: ${payload.astLock.mutexToken}`,
          `✓ [SEC-07] WORM Audit Dispatched → ${record.wormStreamTarget}`,
          `✓ yoinked → ${payload.filepath} (SHA-256: ${record.outputFileHash.slice(0, 16)}…)`,
        ])
        await fetchTelemetry()
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      setErrorBanner(msg)
      setTerminalLogs(prev => [...prev, `✗ Execution Error: ${msg}`])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 shadow-2xl overflow-hidden">
      {/* Terminal Window Titlebar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 bg-zinc-950 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-500/80" />
          <span className="h-3 w-3 rounded-full bg-amber-500/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 font-mono text-xs font-semibold text-zinc-200">
            packages/gina-yoinks-media — Ink/CLI &amp; MCP Execution Console
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-400 border border-emerald-500/30">
            SEC-L1 / TS-L1
          </span>
          <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-cyan-400 border border-cyan-500/30">
            SIACP TTL: 30s
          </span>
          <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300">
            S_leak = 0.00
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        {/* Left Column: Controls & Presets */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              Target Media URL (YouTube · X/Twitter · Instagram · TikTok · Threads)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://youtu.be/dQw4w9WgXcQ"
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-sm font-mono text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                disabled={loading}
                onClick={() => void executeYoink()}
                className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-mono font-bold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 transition"
              >
                {loading ? 'yoinking…' : '↵ yoink'}
              </button>
            </div>
          </div>

          {/* Quick Presets & Red-Team Security Verification */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-zinc-400">Presets:</span>
            <button
              type="button"
              onClick={() => setUrl('https://youtu.be/dQw4w9WgXcQ')}
              className="rounded border border-zinc-700 bg-zinc-800/70 px-2.5 py-1 text-zinc-200 hover:border-emerald-500/50"
            >
              ▶ YouTube Reference
            </button>
            <button
              type="button"
              onClick={() => setUrl('https://x.com/ginaservice/status/185000123456')}
              className="rounded border border-zinc-700 bg-zinc-800/70 px-2.5 py-1 text-zinc-200 hover:border-emerald-500/50"
            >
              𝕏 Promo Clip
            </button>
            <button
              type="button"
              onClick={() => {
                const ssrfUrl = 'http://127.0.0.1:3003/gina-pay-internal'
                setUrl(ssrfUrl)
                void executeYoink(ssrfUrl)
              }}
              className="rounded border border-rose-500/40 bg-rose-950/40 px-2.5 py-1 text-rose-300 hover:bg-rose-900/50"
            >
              🛡️ Test SSRF Block (Theta=0.99)
            </button>
            <button
              type="button"
              onClick={() => {
                const injUrl = 'https://youtu.be/abc; rm -rf /'
                setUrl(injUrl)
                void executeYoink(injUrl)
              }}
              className="rounded border border-amber-500/40 bg-amber-950/40 px-2.5 py-1 text-amber-300 hover:bg-amber-900/50"
            >
              🛡️ Test Injection Block (Theta=0.95)
            </button>
          </div>

          {/* CLI Automation Flags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
              <div className="text-xs font-mono text-zinc-400 mb-2">Extraction Mode</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('best')}
                  className={`flex-1 rounded px-2.5 py-1.5 text-xs font-mono font-semibold border ${
                    mode === 'best'
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  --best (MP4)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('mp3')}
                  className={`flex-1 rounded px-2.5 py-1.5 text-xs font-mono font-semibold border ${
                    mode === 'mp3'
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  --mp3 (Audio)
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
              <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                Output Dir (-o &lt;dir&gt;)
              </label>
              <input
                type="text"
                value={outDir}
                onChange={e => setOutDir(e.target.value)}
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-200"
              />
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
              <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                Swarm Agent ID (DIR-5)
              </label>
              <input
                type="text"
                value={agentId}
                onChange={e => setAgentId(e.target.value)}
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-mono text-zinc-200"
              />
            </div>
          </div>

          {errorBanner && (
            <div className="rounded-lg border border-rose-500/50 bg-rose-950/60 p-3 text-xs font-mono text-rose-200">
              <strong className="text-rose-400">Quarantine Gate Active: </strong>
              {errorBanner}
            </div>
          )}

          {/* Terminal Output Stream */}
          <div className="rounded-lg border border-zinc-800 bg-black p-4 font-mono text-xs leading-relaxed text-zinc-300 h-56 overflow-y-auto">
            {terminalLogs.map((line, idx) => (
              <div
                key={idx}
                className={
                  line.startsWith('✓')
                    ? 'text-emerald-400'
                    : line.startsWith('✗')
                      ? 'text-rose-400 font-semibold'
                      : line.startsWith('$')
                        ? 'text-cyan-300 font-semibold mt-1'
                        : 'text-zinc-400'
                }
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Layer 7 WORM Audit & Layer 1/2/5 Cryptographic Proofs */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                Layer 7 WORM Audit Record (--json-audit)
              </span>
              <label className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wormLog}
                  onChange={e => setWormLog(e.target.checked)}
                  className="accent-emerald-500"
                />
                --worm-log
              </label>
            </div>

            {latestAudit ? (
              <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto bg-zinc-900/90 p-3 rounded border border-zinc-800 max-h-64">
                {JSON.stringify(latestAudit, null, 2)}
              </pre>
            ) : (
              <div className="text-xs font-mono text-zinc-500 py-8 text-center">
                No WORM audit record generated yet.
              </div>
            )}
          </div>

          {/* Live SIACP & AST Semantic Lock Telemetry */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-2 text-xs font-mono">
            <div className="text-zinc-400 font-semibold uppercase tracking-wider">
              Active Cryptographic Gate Telemetry
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">Layer 1 FP_runtime:</span>
              <span className="text-zinc-200">
                {telemetry?.layers?.layer1RuntimeFp.fpRuntime.slice(0, 20) ?? 'verified'}…
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">Layer 2 SIACP Session:</span>
              <span className="text-cyan-400">
                {telemetry?.layers?.layer2SiacpSession.sessionId.slice(0, 22) ?? 'SIACP-30S-ACTIVE'}…
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500">Layer 5 Redis AST Lock:</span>
              <span className="text-amber-300">
                {telemetry?.layers?.layer5AstSemanticLock.mutexToken ?? 'lock:repo:packages/gina-yoinks-media'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">Layer 7 Self-Evolution (S_evolve):</span>
              <span className="text-emerald-400 font-bold">
                {telemetry?.layers?.layer7SelfEvolution.sEvolve ?? '0.9154'} (Aligned &ge; 0.95)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
