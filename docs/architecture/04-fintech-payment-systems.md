# 04 — Fintech & Payment Systems (`skill:fintech-payment-systems`)

- **Document Reference:** `GINA-ANTIGRAVITY-YOINKS-GITHUB-2026-V1`
- **Embedded Algorithmic Property:** Reverse Auditing & MCP Container Isolation (`--cap-drop=ALL`)
- **Sovereign Supervisor (GINA-SEC-7L-2026):** `SEC-04` — `argon.sec-04.arti@security.ginaservice.com`
- **Umbrella:** GINASERVICE SARL AU (Casablanca RC N° 214563) & ReferPay DAO (Singapore CLL#16219882)

## Role in `packages/gina-yoinks-media` Integration
1. **Strict Fintech Isolation (Moroccan Patent No. 30828):** Completely isolates the zero-fee phone-to-phone transfer engine (`HMAC-SHA256` signature with 300-second window in `services/gina-pay`) from the external media processing container (`packages/gina-yoinks-media`).
2. **Layer 4 Container Sandboxing:** Runs `yoinks`, `yt-dlp`, and `ffmpeg-static` inside an unprivileged container (`Dockerfile.yoinks-sandbox`) with `--cap-drop=ALL`, `--security-opt=no-new-privileges:true`, non-root user `gina-media-user`, and a read-only root filesystem except `/tmp/yoinks-downloads`.
