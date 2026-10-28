# 🧬 GinaService Platform

<div align="center">

[![CI/CD](https://github.com/ginaservice/ginaservice/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/ginaservice/ginaservice/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-20+-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://typescriptlang.org)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-violet.svg)](https://turbo.build)

**منصة الخدمات الذكية المتكاملة | Amazon-Grade Microservices**

[🌐 Demo](https://ginaservice.com) · [📚 Docs](./docs) · [🐛 Issues](https://github.com/ginaservice/ginaservice/issues)

</div>

---

## 🏛️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    🌐 GINASERVICE PLATFORM v1.0                     │
│                     Amazon-Grade Microservices                       │
├──────────────────────────────────────────────────────────────────────┤
│              🔒 Nginx Reverse Proxy + TLS Termination               │
├─────────────────────────────────────────────────────────────────────┤
│                   ⚡ API Gateway (Port 3000)                         │
│          Circuit Breaker · Rate Limiting · Tracing · Auth           │
├────────┬────────┬──────────┬────────────┬───────────┬──────────────┤
│  Auth  │ Users  │ GinaPay  │Notification│ Analytics │  Chameleon   │
│ :3001  │ :3002  │  :3003   │   :3004    │  :3005    │  Core :3006  │
├────────┴────────┴──────────┴────────────┴───────────┴──────────────┤
│           📊 PostgreSQL · ⚡ Redis · 📁 GCS / S3                    │
├─────────────────────────────────────────────────────────────────────┤
│    📈 Prometheus + Grafana · 🔍 Jaeger Tracing · 🚨 Sentry         │
└─────────────────────────────────────────────────────────────────────┘
```

## 📁 Monorepo Structure (Turborepo + pnpm)

```
ginaservice/
├── 📱 apps/
│   ├── web/                    # React + Vite + Tailwind (Lovable-ready ✅)
│   ├── admin/                  # Admin Dashboard
│   └── docs/                   # Documentation site
│
├── 📦 packages/
│   ├── ui/                     # shadcn/ui component library
│   ├── types/                  # Shared TypeScript types
│   ├── config/                 # ESLint, Prettier, TS configs
│   ├── utils/                  # Shared utilities
│   ├── sdk/                    # GinaService JS/TS SDK
│   └── gina-yoinks-media/      # 🎬 Sovereign Media CLI & MCP Tool (GINA-SEC-7L-2026)
│
├── ⚙️ services/
│   ├── api-gateway/            # Central gateway (Port 3000)
│   ├── auth-service/           # Auth + JWT + MFA (Port 3001)
│   ├── user-service/           # User management (Port 3002)
│   ├── gina-pay/               # 💳 Payment engine (Port 3003)
│   ├── notification-service/   # Multi-channel notifications (Port 3004)
│   ├── analytics-service/      # Analytics (Port 3005)
│   └── chameleon-core/         # 🦎 Adaptive AI skills (Port 3006)
│
├── 🏗️ infra/
│   ├── docker/                 # Docker Compose + Dockerfiles
│   ├── k8s/                    # Kubernetes manifests (Kustomize)
│   ├── terraform/              # Infrastructure as Code (AWS EKS)
│   └── helm/                   # Helm charts
│
├── 🧪 tests/
│   ├── e2e/                    # Playwright E2E tests
│   ├── load/                   # k6 load tests
│   └── security/               # Security tests
│
└── 📚 docs/
    ├── architecture/           # Architecture Decision Records
    ├── api/                    # OpenAPI specs
    └── runbooks/               # Operational runbooks
```

## 💳 GinaPay — Fee Structure

| Payment Method | Processing Fee |
|---------------|---------------|
| 🏦 Bank Transfer | 0.5% + \$0.25 |
| 🧬 **GinaWallet** | **0.5% + \$0.00** ⭐ |
| ₿ Crypto | 1.0% + \$0.00 |
| 🍎 Apple Pay | 2.5% + \$0.10 |
| 🟢 Google Pay | 2.5% + \$0.10 |
| 💳 Debit Card | 2.5% + \$0.30 |
| 💳 Credit Card | 2.9% + \$0.30 |
| 🅿️ PayPal | 3.4% + \$0.30 |

## 🚀 Quick Start

```bash
# Prerequisites: Node 20+, pnpm 9+, Docker
git clone https://github.com/ginaservice/ginaservice.git
cd ginaservice

# Setup
cp .env.example .env
pnpm install

# Start all services (Docker)
pnpm docker:up

# OR development mode (all services hot-reload)
pnpm dev
```

Visit: http://localhost:3100 (Web) · http://localhost:3000/health (API)

## 🎨 Lovable Integration

This project is **fully compatible** with [Lovable](https://lovable.dev):

- ✅ **Vite + React + TypeScript** — standard Lovable stack
- ✅ **Tailwind CSS** — configured with shadcn/ui variables
- ✅ **shadcn/ui components** — in `packages/ui`
- ✅ **Supabase-compatible** — auth/database layer abstracted
- ✅ **TanStack Query** — data fetching layer
- ✅ **TanStack Router** — type-safe routing
- ✅ **Zod schemas** — shared with backend

To use with Lovable, point it to `apps/web/` as the project root.

## 🏗️ Infrastructure (AWS EKS)

| Component | Technology |
|-----------|-----------|
| Container Orchestration | AWS EKS (Kubernetes 1.30) |
| Database | RDS PostgreSQL 16 (Multi-AZ) |
| Cache | ElastiCache Redis 7 |
| Object Storage | S3 + CloudFront |
| CDN | CloudFront |
| DNS | Route 53 |
| TLS | ACM |
| Secrets | AWS Secrets Manager |
| Monitoring | CloudWatch + Prometheus + Grafana |
| Tracing | Jaeger / AWS X-Ray |
| CI/CD | GitHub Actions |

## 📊 Service Health

| Service | Port | Status |
|---------|------|--------|
| API Gateway | 3000 | ![healthy](https://img.shields.io/badge/-healthy-green) |
| Auth Service | 3001 | ![healthy](https://img.shields.io/badge/-healthy-green) |
| User Service | 3002 | ![healthy](https://img.shields.io/badge/-healthy-green) |
| GinaPay | 3003 | ![healthy](https://img.shields.io/badge/-healthy-green) |
| Notifications | 3004 | ![healthy](https://img.shields.io/badge/-healthy-green) |
| Chameleon Core | 3006 | ![healthy](https://img.shields.io/badge/-healthy-green) |

## 📄 License

MIT © 2026 GinaService Team
