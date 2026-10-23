/**
 * @gina/sdk — Official GinaService TypeScript/JavaScript Client SDK
 * Covers Auth, Users & KYC, GinaPay, Notifications, Chameleon Core, and Analytics
 */

export interface GinaSDKOptions {
  baseUrl?: string
  apiKey?: string
  accessToken?: string
  language?: 'ar' | 'en'
  timeoutMs?: number
}

export interface GinaTransferRequest {
  recipientId: string
  amount: number
  currency: 'SAR' | 'USD' | 'EUR' | 'AED' | 'EGP' | 'BTC' | 'ETH' | 'USDT'
  method?: 'wallet' | 'card' | 'bank' | 'crypto' | 'apple_pay' | 'google_pay'
  description?: string
  idempotencyKey?: string
}

export interface ChameleonExecuteRequest {
  skillId: string
  mode?: 'stealth' | 'execution' | 'defensive' | 'learning' | 'adaptive'
  payload: Record<string, unknown>
}

export class GinaSDK {
  private baseUrl: string
  private apiKey?: string
  private accessToken?: string
  private language: 'ar' | 'en'
  private timeoutMs: number

  constructor(options: GinaSDKOptions = {}) {
    this.baseUrl = (options.baseUrl || 'http://localhost:3000').replace(/\/$/, '')
    this.apiKey = options.apiKey
    this.accessToken = options.accessToken
    this.language = options.language || 'ar'
    this.timeoutMs = options.timeoutMs || 15_000
  }

  public setAccessToken(token: string) {
    this.accessToken = token
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept-Language': this.language,
      'X-Trace-ID': `trc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      'X-SDK-Version': '1.0.0',
      ...(init.headers as Record<string, string> | undefined),
    }

    if (this.accessToken) headers['Authorization'] = `Bearer ${this.accessToken}`
    if (this.apiKey) headers['X-API-Key'] = this.apiKey

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers,
        signal: controller.signal,
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(errBody.message || `GinaSDK HTTP Error ${res.status}`)
      }

      return (await res.json()) as T
    } finally {
      clearTimeout(timer)
    }
  }

  // ── Auth ──
  public readonly auth = {
    login: (email: string, password: string) =>
      this.request<{ user: unknown; tokens: { accessToken: string; refreshToken: string } }>(
        '/api/v1/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) }
      ),
    register: (data: { email: string; password: string; fullName: string; phone?: string; referralCode?: string }) =>
      this.request<{ user: unknown; tokens: { accessToken: string; refreshToken: string } }>(
        '/api/v1/auth/register',
        { method: 'POST', body: JSON.stringify(data) }
      ),
    verifyMfa: (code: string) =>
      this.request<{ verified: boolean }>('/api/v1/auth/mfa/verify', {
        method: 'POST',
        body: JSON.stringify({ code }),
      }),
  }

  // ── Users & KYC ──
  public readonly users = {
    me: () => this.request<Record<string, unknown>>('/api/v1/users/me'),
    wallets: () => this.request<Record<string, unknown>[]>('/api/v1/users/me/wallets'),
    submitKyc: (level: 1 | 2 | 3 | 4 | 5, documents: Array<{ type: string; url: string }>) =>
      this.request<Record<string, unknown>>('/api/v1/users/me/kyc', {
        method: 'POST',
        body: JSON.stringify({ level, documents }),
      }),
    referrals: () => this.request<{ referralCode: string; totalReferrals: number; totalEarned: number }>('/api/v1/users/me/referrals'),
  }

  // ── GinaPay ──
  public readonly pay = {
    transfer: (req: GinaTransferRequest) =>
      this.request<Record<string, unknown>>('/api/v1/pay/transactions', {
        method: 'POST',
        headers: {
          'Idempotency-Key': req.idempotencyKey || `idem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        },
        body: JSON.stringify({ ...req, method: req.method || 'wallet' }),
      }),
    calculateFee: (amount: number, currency = 'SAR', method = 'wallet') =>
      this.request<Record<string, unknown>>(
        `/api/v1/pay/fees?amount=${amount}&currency=${currency}&method=${method}`
      ),
    listTransactions: (limit = 20) =>
      this.request<Record<string, unknown>[]>(`/api/v1/pay/transactions?limit=${limit}`),
  }

  // ── Chameleon Core ──
  public readonly chameleon = {
    executeSkill: (req: ChameleonExecuteRequest) =>
      this.request<Record<string, unknown>>('/api/v1/chameleon/execute', {
        method: 'POST',
        body: JSON.stringify(req),
      }),
    setMode: (mode: 'stealth' | 'execution' | 'defensive' | 'learning' | 'adaptive') =>
      this.request<{ mode: string; updatedAt: string }>('/api/v1/chameleon/mode', {
        method: 'PUT',
        body: JSON.stringify({ mode }),
      }),
    listSkills: () => this.request<Record<string, unknown>[]>('/api/v1/chameleon/skills'),
  }

  // ── Analytics ──
  public readonly analytics = {
    trackEvent: (event: string, properties: Record<string, unknown> = {}) =>
      this.request<{ accepted: boolean }>('/api/v1/analytics/events', {
        method: 'POST',
        body: JSON.stringify({ event, properties, timestamp: new Date().toISOString() }),
      }),
    getOverview: () => this.request<Record<string, unknown>>('/api/v1/analytics/overview'),
  }
}

export default GinaSDK
