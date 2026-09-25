import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, adminToken, validAdminPassword } from '@/lib/adminAuth'

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: '' }))
  if (!validAdminPassword(password)) return NextResponse.json({ error: 'Złe hasło' }, { status: 401 })
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, adminToken(), { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60*60*8 })
  return res
}
