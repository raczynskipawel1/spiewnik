import { createHmac, timingSafeEqual } from 'crypto'

export const ADMIN_COOKIE = 'songbook-admin-session'

function secret() {
  const s = process.env.ADMIN_PASSWORD
  if (!s) throw new Error('Brak ADMIN_PASSWORD')
  return s
}

export function adminToken() {
  return createHmac('sha256', secret()).update('spiewnik-admin-v1').digest('hex')
}

export function validAdminToken(value?: string) {
  if (!value) return false
  const expected = adminToken()
  if (value.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected))
}

export function validAdminPassword(value?: string) {
  const expected = secret()
  if (!value || value.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected))
}
