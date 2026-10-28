'use client'

import React, {useState} from 'react'
import {YoinksConsole, type AuditStreamEntry} from '@/components/YoinksConsole'

const SOVEREIGN_MATRIX = [
  {
    id: '01',
    file: '01-web3-blockchain-architect.md',
    skill: 'skill:web3-blockchain-architect',
    property: 'Intent Completeness (S_comp) & Proactive Inquiry',
    supervisor: 'SEC-01: argon.sec-01.ciso@security.ginaservice.com',
    description:
      'Verifies FP_runtime & HMAC-SHA256, anchors media SHA-256 hashes to IPFS / Arweave, and attests creator rights via TON (TEP-74) & EVM (ERC-4337).',
    badge: 'IPFS · TEP-74 · ERC-4337',
  },
  {
    id: '02',
    file: '02-legal-compliance-counsel.md',
    skill: 'skill:legal-compliance-counsel',
    property: 'Dynamic Skill Routing (Chameleon Scales)',
    supervisor: 'SEC-02: argon.sec-02.ztna@security.ginaservice.com',
    description:
      'Preserves MIT License (TS-L1, R_legal=1.0), enforces Moroccan Law 09-08 (CNDP) & GDPR, and restricts outbound traffic via 30s SIACP tokens.',
    badge: 'MIT · CNDP 09-08 · SIACP 30s',
  },
  {
    id: '03',
    file: '03-strategic-growth-persuasion.md',
    skill: 'skill:strategic-growth-persuasion',
    property: 'Hybrid Execution (Singapore Cloud + Casablanca Edge)',
    supervisor: 'SEC-03: argon.sec-03.icam@security.ginaservice.com',
    description:
      'Empowers DIR-5 Marketing Swarm (@comms.ginaservice.com) to produce daily 9:16 vertical promos for Gina Market & ReferPay (50% commission on 50 MAD/yr).',
    badge: 'DIR-5 · ReferPay 50% · SEC-L1',
  },
  {
    id: '04',
    file: '04-fintech-payment-systems.md',
    skill: 'skill:fintech-payment-systems',
    property: 'Reverse Auditing & MCP Container Isolation (--cap-drop=ALL)',
    supervisor: 'SEC-04: argon.sec-04.arti@security.ginaservice.com',
    description:
      'Air-gaps Moroccan Patent No. 30828 zero-fee transfer engine (HMAC-SHA256, 300s window) from media containers and enforces Theta < 0.85 quarantine.',
    badge: 'Patent 30828 Isolated · Layer 4',
  },
  {
    id: '05',
    file: '05-red-team-devils-advocate.md',
    skill: 'skill:red-team-devils-advocate',
    property: '3-Tier Memory, DocumentMutexLock & AST Locks',
    supervisor: 'SEC-05: pro.sec-05.emsi@security.ginaservice.com',
    description:
      'Blocks SSRF & command injection, verifies SHA-256 of yt-dlp & ffmpeg-static, and locks branch agent/DEV-MEDIA/yoinks-integration via Redis AST.',
    badge: 'Theta < 0.85 · SHA-256 Verified',
  },
  {
    id: '06',
    file: '06-workspace-operations-admin.md',
    skill: 'skill:workspace-operations-administrator',
    property: 'Trade-Secret Gate GINA-TSIU (S_leak = 0.00)',
    supervisor: 'SEC-06: argon.sec-06.tsiu-lead@security.ginaservice.com',
    description:
      'Automates archiving of downloaded media to Google Drive with DocumentMutexLock while scrubbing child-process env vars (S_leak=0.00, R_secret=1.0).',
    badge: 'S_leak = 0.00 · R_secret = 1.0',
  },
  {
    id: '07',
    file: '07-idea-engineering-evolution.md',
    skill: 'skill:idea-engineering-analysis-development',
    property: 'Self-Evolution (S_evolve), WORM Log & <2s Rollback',
    supervisor: 'SEC-07: pro.sec-07.worm-audit@security.ginaservice.com',
    description:
      'Logs every media operation to immutable WORM stream (audit-stream@ginaservice.com) with Merkle root attestation and S_evolve monitoring.',
    badge: 'WORM Audit · <2s Rollback',
  },
]

export default function DashboardPage() {
  const [auditHistory, setAuditHistory] = useState<AuditStreamEntry[]>([])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top Sovereign Navigation Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-emerald-400">
                GINA-ANTIGRAVITY-YOINKS-GITHUB-2026-V1
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">
              GINASERVICE SARL AU &amp; ReferPay DAO — Sovereign Antigravity Portal
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-300">
              Casablanca RC N° 214563
            </span>
            <span className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-300">
              Singapore CLL#16219882
            </span>
            <span className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-emerald-300 font-semibold">
              GINA-SEC-7L-2026: ACTIVE
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-10">
        {/* Top KPI Metrics Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="text-xs font-mono text-zinc-400">Security Classification</div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
              SEC-L1 / TS-L1 (MIT)
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              S_leak = 0.00 · R_secret = 1.0 · R_legal = 1.0
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="text-xs font-mono text-zinc-400">Fintech Isolation (Patent 30828)</div>
            <div className="text-lg font-bold font-mono text-cyan-400 mt-1">
              AIR-GAPPED (TS-L3/L4)
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              HMAC-SHA256 · 300s Window · Bell-LaPadula
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="text-xs font-mono text-zinc-400">MCP Tool &amp; Sandbox</div>
            <div className="text-lg font-bold font-mono text-amber-300 mt-1">
              gina_yoink_media
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              --cap-drop=ALL · gina-media-user · Read-Only FS
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="text-xs font-mono text-zinc-400">Marketing Swarm (DIR-5)</div>
            <div className="text-lg font-bold font-mono text-purple-300 mt-1">
              Gina Market &amp; ReferPay
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              9:16 Vertical Promos · 50% Instant Commission
            </div>
          </div>
        </section>

        {/* Interactive Yoinks Console Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                🎬 Yoinks Sovereign Media Console (`@gina/yoinks-media`)
              </h2>
              <p className="text-xs text-zinc-400">
                Interactive &amp; Headless (`--best`, `--mp3`, `-o &lt;dir&gt;`, `--worm-log`) Media Extraction with Layer 4 Quarantine (`Theta &lt; 0.85`)
              </p>
            </div>
            <span className="font-mono text-xs text-zinc-400">
              Branch: <code className="text-emerald-400">agent/DEV-MEDIA/yoinks-integration</code>
            </span>
          </div>

          <YoinksConsole
            onAuditRecordCreated={record =>
              setAuditHistory(prev => [record, ...prev.slice(0, 9)])
            }
          />
        </section>

        {/* 7 Files x 7 Properties x 7 Accounts Sovereign Matrix */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              🏛️ 7-File × 7-Property × 7-Account Sovereign Architecture Matrix
            </h2>
            <p className="text-xs text-zinc-400">
              Complete projection of `@gina/yoinks-media` across the 7 Modular Architecture Files and `GINA-SEC-7L-2026` Supervisor Accounts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SOVEREIGN_MATRIX.map(item => (
              <div
                key={item.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 flex flex-col justify-between hover:border-zinc-700 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      LAYER {item.id} · {item.file}
                    </span>
                    <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-300">
                      {item.badge}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-cyan-400">{item.supervisor}</div>
                  <div className="text-xs font-semibold text-zinc-200">{item.property}</div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                  <span>{item.skill}</span>
                  <span className="text-emerald-400">● VERIFIED</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live Session WORM Audit Stream Table */}
        {auditHistory.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">
              📜 Live Session WORM Audit Stream (`audit-stream@ginaservice.com`)
            </h2>
            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60">
              <table className="w-full text-left font-mono text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-950 text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">Task UUID</th>
                    <th className="px-4 py-3">Agent ID</th>
                    <th className="px-4 py-3">Mode</th>
                    <th className="px-4 py-3">Output Path</th>
                    <th className="px-4 py-3">SHA-256 File Hash</th>
                    <th className="px-4 py-3">Theta / S_leak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {auditHistory.map(entry => (
                    <tr key={entry.taskUuid} className="hover:bg-zinc-800/30">
                      <td className="px-4 py-2.5 text-emerald-400">{entry.taskUuid.slice(0, 18)}…</td>
                      <td className="px-4 py-2.5 text-zinc-300">{entry.agentId}</td>
                      <td className="px-4 py-2.5">
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-cyan-300">
                          --{entry.mode}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-300">{entry.filepath}</td>
                      <td className="px-4 py-2.5 text-zinc-400">{entry.outputFileHash.slice(0, 20)}…</td>
                      <td className="px-4 py-2.5 text-emerald-400">
                        θ={entry.threatScoreTheta.toFixed(2)} / S_leak={entry.leakageScoreSLeak.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
