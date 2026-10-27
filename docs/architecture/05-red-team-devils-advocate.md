# 05 — Red Team & Devil's Advocate (`skill:red-team-devils-advocate`)

- **Document Reference:** `GINA-ANTIGRAVITY-YOINKS-GITHUB-2026-V1`
- **Embedded Algorithmic Property:** 3-Tier Memory, `DocumentMutexLock` & Redis AST Semantic Locks
- **Sovereign Supervisor (GINA-SEC-7L-2026):** `SEC-05` — `pro.sec-05.emsi@security.ginaservice.com`
- **Umbrella:** GINASERVICE SARL AU (Casablanca RC N° 214563) & ReferPay DAO (Singapore CLL#16219882)

## Role in `packages/gina-yoinks-media` Integration
1. **Pre-Ingestion Quarantine Gate (`Theta < 0.85`):** Every URL passed to `yoinks` (CLI, Ink TUI, or MCP server) is inspected by `GinaYoinksSecurityGuard.validateAndSanitizeUrl()` to block shell metacharacters, `--exec` injection, `file://` URIs, and SSRF attempts targeting internal/sovereign networks (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`, `172.16.0.0/12`, `*.ginaservice.com`).
2. **Binary SHA-256 Verification:** Verifies `yt-dlp` and `ffmpeg-static` binary SHA-256 hashes before spawning child processes (`GinaYoinksSecurityGuard.verifyBinaryIntegrity()`).
3. **AST Semantic Merge Lock:** Protects branch `agent/DEV-MEDIA/yoinks-integration` and path `lock:repo:packages/gina-yoinks-media`.
