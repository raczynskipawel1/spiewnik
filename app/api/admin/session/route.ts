import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, validAdminToken } from '@/lib/adminAuth'
export async function GET(req: NextRequest) { return NextResponse.json({ authenticated: validAdminToken(req.cookies.get(ADMIN_COOKIE)?.value) }) }
