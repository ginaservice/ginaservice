# 🧬 GINA ECC Skills Suite (`gina-ecc-suite`)

Modular skills (`SKILL.md`), autonomous agent definitions (`agents/`), slash-command shims (`commands/`), language/framework rules (`rules/`), and execution configs (`configs/`) imported from [Everything Claude Code (ECC)](https://github.com/affaan-m/ECC) and harmonized for the **GINA Sovereign Multi-Agent Architecture** (`Chameleon Core`).

## 🛡️ Security Charter & Architecture Alignment

- **Security Protocol:** `GINA-SEC-7L-2026` Zero-Trust Architecture
- **Sandbox Execution:** Local container isolation with `--cap-drop=ALL --security-opt=no-new-privileges:true --read-only`
- **Zero-Leakage DLP:** `S_leak = 0.00`, `R_secret = 1.00` — all Anthropic-specific internal paths (`~/.claude/`) replaced with model-agnostic `${GINA_HOME:-~/.gina}/` hooks; zero external telemetry egress
- **3-Tier Memory Topology:**
  - **L1 (Hot State):** Redis 7 (`gina:chameleon:state:{userId}:{skillId}`)
  - **L2 (Warm Context):** PostgreSQL 16 + `pgvector` (`skill_executions` & Redis AST locks)
  - **L3 (Cold Ledger):** Immutable SHA-256 WORM Audit Log (`audit-stream@ginaservice.com`)

## 📦 Inventory Summary

| Asset Type | Count | Location | Description |
|------------|------:|----------|-------------|
| **Modular Skills (`SKILL.md`)** | **311** | [`skills/`](skills/) | Subdivided into `engineering` (87), `architecture` (60), `testing` (73), `operations` (70), and `security` (21) |
| **Agent Definitions** | **71** | [`agents/`](agents/) | Model-agnostic autonomous agent roles mapped to GINA cognitive tiers |
| **Command Shims** | **97** | [`commands/`](commands/) | Operational workflow and slash-command specifications |
| **Coding & Security Rules** | **122** | [`rules/`](rules/) | Common + 20 language/framework rule packs |
| **Standalone Helper Scripts** | **121** | `skills/*/*/scripts/` | Python, Bash, and JS helper utilities with stdlib fallbacks |
| **Master Catalogs** | **2** | [`SKILLS_INDEX.md`](SKILLS_INDEX.md), [`INDEX.json`](INDEX.json) | Human-readable Markdown index and machine-searchable JSON catalog |

## 🗂️ Directory Structure

```text
gina-ecc-suite/
├── skills/
│   ├── engineering/     # 87 framework, language, database, API & UI skills
│   ├── architecture/    # 60 agent harness, memory topology, ADR & system design skills
│   ├── testing/         # 73 TDD, E2E, evals, benchmark & verification loop skills
│   ├── operations/      # 70 DevOps, Docker, orchestration, operator & media skills
│   └── security/        # 21 security review, hardening, smart-contract & DLP skills
├── agents/              # 71 autonomous agent role definitions
├── commands/            # 97 slash-command shims
├── rules/               # 122 coding, testing, hooks & security rules across 21 stacks
├── configs/             # GINA 3-Tier Memory & GINA-SEC-7L-2026 execution shims + MCP mappings
├── SKILLS_INDEX.md      # Complete Markdown catalog of all 311 skills & 71 agents
├── INDEX.json           # Searchable JSON registry with tags, triggers & script manifests
└── README.md            # Suite overview and verification documentation
```

## 📄 License

MIT License — Upstream ECC Copyright (c) Affaan Mustafa & contributors; Sovereign GINA Adaptation Copyright (c) 2026 GINASERVICE SARL AU & ReferPay DAO.
