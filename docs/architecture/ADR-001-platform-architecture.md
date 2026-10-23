# ADR-001: GinaService Microservices, GinaPay & Chameleon Core Architecture

- **Status:** Accepted
- **Date:** 2026-10-23

## Context
GinaService requires an Amazon-grade multi-service platform supporting bilingual Arabic/English RTL/LTR interfaces, Lovable compatibility (`apps/web`), a multi-currency payment engine (`GinaPay` with `GinaWallet` at 0.5% best rate), a 5-level KYC compliance system, and the adaptive 5-mode `Chameleon Core` AI skills engine.

## Decision
1. **Monorepo:** Turborepo + pnpm workspaces (`apps/*`, `packages/*`, `services/*`).
2. **Backend Framework:** Fastify v4 on Node 20-alpine with PostgreSQL 16 and Redis 7.
3. **Security:** JWT + TOTP MFA, Redis token revocation, per-route rate limiting, circuit breakers, and HMAC-SHA256 signed audit logs.
4. **Frontend:** Vite 5 + React 18 + TypeScript + Tailwind CSS + shadcn/ui in `apps/web` for seamless Lovable compatibility.
