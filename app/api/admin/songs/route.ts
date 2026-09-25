import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, validAdminToken } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
function authorized(req: NextRequest) { return validAdminToken(req.cookies.get(ADMIN_COOKIE)?.value) }
export async function POST(req: NextRequest) {
 if(!authorized(req)) return NextResponse.json({error:'Brak uprawnień'},{status:401})
 const body=await req.json(); const {data,error}=await supabaseAdmin().from('songs').insert(body).select().single()
 if(error) return NextResponse.json({error:error.message},{status:400}); return NextResponse.json({data})
}
