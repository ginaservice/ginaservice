/**
 * @gina/utils — Shared Utilities for GinaService Platform
 * Formatting, Fee Calculation, Validation, Masking, Crypto & Resilience Helpers
 */

import { createHmac, randomUUID } from 'crypto'

export type SupportedCurrency = 'SAR' | 'USD' | 'EUR' | 'AED' | 'EGP' | 'GBP' | 'BTC' | 'ETH' | 'USDT'
export type PaymentMethodId = 'wallet' | 'card' | 'debit_card' | 'bank' | 'crypto' | 'apple_pay' | 'google_pay' | 'paypal'

export interface FeeBreakdown {
  amount: number
  currency: SupportedCurrency
  method: PaymentMethodId
  percentageRate: number
  fixedFee: number
  totalFee: number
  netAmount: number
  totalCharged: number
  isBestRate: boolean
}

export const FEE_SCHEDULE: Record<PaymentMethodId, { rate: number; fixedUSD: number; labelAr: string; labelEn: string }> = {
  wallet:     { rate: 0.005, fixedUSD: 0.00, labelAr: 'محفظة جينا (أفضل سعر)', labelEn: 'GinaWallet (Best Rate)' },
  bank:       { rate: 0.005, fixedUSD: 0.25, labelAr: 'تحويل بنكي', labelEn: 'Bank Transfer' },
  crypto:     { rate: 0.010, fixedUSD: 0.00, labelAr: 'عملات مشفرة', labelEn: 'Cryptocurrency' },
  apple_pay:  { rate: 0.025, fixedUSD: 0.10, labelAr: 'Apple Pay', labelEn: 'Apple Pay' },
  google_pay: { rate: 0.025, fixedUSD: 0.10, labelAr: 'Google Pay', labelEn: 'Google Pay' },
  debit_card: { rate: 0.025, fixedUSD: 0.30, labelAr: 'بطاقة مدى / خصم', labelEn: 'Debit Card' },
  card:       { rate: 0.029, fixedUSD: 0.30, labelAr: 'بطاقة ائتمانية', labelEn: 'Credit Card' },
  paypal:     { rate: 0.034, fixedUSD: 0.30, labelAr: 'PayPal', labelEn: 'PayPal' },
}

const FX_TO_USD: Record<SupportedCurrency, number> = {
  USD: 1.0,
  SAR: 0.2666,
  AED: 0.2723,
  EUR: 1.08,
  GBP: 1.27,
  EGP: 0.0205,
  USDT: 1.0,
  BTC: 65000,
  ETH: 3500,
}

/**
 * Calculate GinaPay transaction fee for any payment method and currency
 */
export function calculateGinaPayFee(
  amount: number,
  currency: SupportedCurrency = 'SAR',
  method: PaymentMethodId = 'wallet'
): FeeBreakdown {
  const schedule = FEE_SCHEDULE[method] || FEE_SCHEDULE.wallet
  const usdPerUnit = FX_TO_USD[currency] || 1
  const fixedInCurrency = schedule.fixedUSD / usdPerUnit
  const totalFee = Number((amount * schedule.rate + fixedInCurrency).toFixed(2))
  const netAmount = Number(Math.max(0, amount - totalFee).toFixed(2))

  return {
    amount,
    currency,
    method,
    percentageRate: schedule.rate,
    fixedFee: Number(fixedInCurrency.toFixed(2)),
    totalFee,
    netAmount,
    totalCharged: Number((amount + totalFee).toFixed(2)),
    isBestRate: method === 'wallet',
  }
}

/**
 * Format currency amount in Arabic or English locale
 */
export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = 'SAR',
  locale: 'ar-SA' | 'en-US' = 'ar-SA'
): string {
  if (currency === 'BTC' || currency === 'ETH') {
    return `${amount.toFixed(6)} ${currency}`
  }
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency === 'USDT' ? 'USD' : currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

/**
 * Format date in Arabic or English locale
 */
export function formatDate(
  date: Date | string | number,
  locale: 'ar-SA' | 'en-US' = 'ar-SA'
): string {
  const d = typeof date === 'object' ? date : new Date(date)
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Generate prefixed GinaService entity ID
 */
export function generateGinaId(prefix: 'usr' | 'tx' | 'wal' | 'kyc' | 'ntf' | 'skl' | 'trc' = 'tx'): string {
  return `gina_${prefix}_${randomUUID().replace(/-/g, '').slice(0, 20)}`
}

/**
 * Generate unique referral code
 */
export function generateReferralCode(name = 'GINA'): string {
  const clean = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4) || 'GINA'
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `${clean}-${rand}`
}

/**
 * Mask email for privacy logs (e.g. m***d@ginaservice.com)
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain || !local) return '***'
  if (local.length <= 2) return `${local[0]}*@${domain}`
  return `${local[0]}${'*'.repeat(Math.min(local.length - 2, 5))}${local[local.length - 1]}@${domain}`
}

/**
 * Mask phone number (e.g. +9665****1234)
 */
export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '')
  if (cleaned.length < 7) return '****'
  return `${cleaned.slice(0, 4)}****${cleaned.slice(-4)}`
}

/**
 * Create HMAC-SHA256 tamper-proof signature for audit logs & webhooks
 */
export function createHmacSignature(payload: unknown, secret: string): string {
  const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload)
  return createHmac('sha256', secret).update(serialized).digest('hex')
}

/**
 * Verify HMAC-SHA256 signature
 */
export function verifyHmacSignature(payload: unknown, signature: string, secret: string): boolean {
  const expected = createHmacSignature(payload, secret)
  return expected === signature
}

/**
 * Retry async operation with exponential backoff + jitter (Amazon standard)
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: { maxAttempts?: number; baseDelayMs?: number; maxDelayMs?: number } = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 4
  const baseDelayMs = options.baseDelayMs ?? 250
  const maxDelayMs = options.maxDelayMs ?? 10000

  let lastError: unknown
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt === maxAttempts) break
      const expDelay = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt - 1))
      const jitter = Math.random() * expDelay * 0.25
      await new Promise((resolve) => setTimeout(resolve, expDelay + jitter))
    }
  }
  throw lastError
}
