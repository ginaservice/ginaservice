---
name: nanoclaw-repl
description: "Operate and extend NanoClaw, ECC's zero-dependency session-aware REPL, with persistent markdown-backed sessions and slash commands for model switching, skill loading, session branching, cross-session search, history compaction, and export. Use when running or extending scripts/claw.js, or when resuming, branching, compacting, searching, or exporting a NanoClaw session."
category: architecture
allowed-tools: "Read, Grep, Glob, Bash, Edit, Write"
file_names: ["SKILL.md"]
metadata:
  origin: ECC
  architecture: GINA-Sovereign-Multi-Agent
  security_charter: GINA-SEC-7L-2026
  memory_topology: 3-tier-L1-L2-L3
  sandbox_policy: "--cap-drop=ALL"
  dlp_leakage_score: "0.00"
---


# NanoClaw REPL

Use this skill when running or extending `scripts/claw.js`.

## Capabilities

- persistent markdown-backed sessions
- model switching with `/model`
- dynamic skill loading with `/load`
- session branching with `/branch`
- cross-session search with `/search`
- history compaction with `/compact`
- export to md/json/txt with `/export`
- session metrics with `/metrics`

## Operating Guidance

1. Keep sessions task-focused.
2. Branch before high-risk changes.
3. Compact after major milestones.
4. Export before sharing or archival.

## Extension Rules

- keep zero external runtime dependencies
- preserve markdown-as-database compatibility
- keep command handlers deterministic and local
