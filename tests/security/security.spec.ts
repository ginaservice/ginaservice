/**
 * GinaService Security & HMAC Integrity Verification
 */
import { createHmac } from 'crypto'

export function verifyAuditSignature(payload: Record<string, unknown>, secret: string, signature: string): boolean {
  const digest = createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex')
  return digest === signature
}
