import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, validAdminToken } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
function authorized(req: NextRequest) { return validAdminToken(req.cookies.get(ADMIN_COOKIE)?.value) }
export async function PATCH(req: NextRequest, {params}:{params:Promise<{id:string}>}) {
 if(!authorized(req)) return NextResponse.json({error:'Brak uprawnień'},{status:401}); const {id}=await params; const body=await req.json();
 const {error}=await supabaseAdmin().from('songs').update(body).eq('id',id); if(error) return NextResponse.json({error:error.message},{status:400}); return NextResponse.json({ok:true})
}
export async function DELETE(req: NextRequest, {params}:{params:Promise<{id:string}>}) {
 if(!authorized(req)) return NextResponse.json({error:'Brak uprawnień'},{status:401}); const {id}=await params;
 const {error}=await supabaseAdmin().from('songs').delete().eq('id',id); if(error) return NextResponse.json({error:error.message},{status:400}); return NextResponse.json({ok:true})
}
