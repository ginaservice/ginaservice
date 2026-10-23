# GinaService Operational Runbook — Incident Response & Circuit Breaker Recovery

## 1. Service Health Verification
Check aggregated health across all 7 microservices:
- API Gateway: `http://localhost:3000/health`
- Auth Service: `http://localhost:3001/health`
- User Service: `http://localhost:3002/health`
- GinaPay Service: `http://localhost:3003/health`
- Notification Service: `http://localhost:3004/health`
- Analytics Service: `http://localhost:3005/health`
- Chameleon Core: `http://localhost:3006/health`

## 2. GinaPay High-Risk Transaction Escalation
Transactions scoring `>= 75` on the Fraud Detection Engine are automatically held in `frozen_balance` and logged with an HMAC-SHA256 signature in `audit_logs`.

## 3. Chameleon Core Emergency Mode Switch
During DDoS or anomalous traffic spikes, switch `chameleon-core` to `defensive` mode via `PUT /api/v1/chameleon/mode`.
