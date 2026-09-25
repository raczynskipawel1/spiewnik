import { NextResponse } from 'next/server'
import { ADMIN_COOKIE } from '@/lib/adminAuth'
export async function POST() { const r=NextResponse.json({ok:true}); r.cookies.set(ADMIN_COOKIE,'',{httpOnly:true,path:'/',maxAge:0}); return r }
