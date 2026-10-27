# 06 — Workspace Operations Administrator (`skill:workspace-operations-administrator`)

- **Document Reference:** `GINA-ANTIGRAVITY-YOINKS-GITHUB-2026-V1`
- **Embedded Algorithmic Property:** Trade-Secret Leakage Prevention Gate `GINA-TSIU` (`S_leak = 0.00`)
- **Sovereign Supervisor (GINA-SEC-7L-2026):** `SEC-06` — `argon.sec-06.tsiu-lead@security.ginaservice.com`
- **Umbrella:** GINASERVICE SARL AU (Casablanca RC N° 214563) & ReferPay DAO (Singapore CLL#16219882)

## Role in `packages/gina-yoinks-media` Integration
1. **Automated Asset Routing (`-o <dir>`):** Enables automated routing of downloaded MP4/MP3 media from `~/Downloads` or `/tmp/yoinks-downloads` into approved Google Drive archival directories with `DocumentMutexLock` synchronization.
2. **Zero Secret Leakage (`S_leak = 0.00`, `R_secret = 1.0`):** `GinaYoinksSecurityGuard.createSanitizedChildEnv()` strips all sensitive sovereign environment variables before invoking `yt-dlp` or `ffmpeg`, and embeds the structural `GINA_AST_WATERMARK`.
