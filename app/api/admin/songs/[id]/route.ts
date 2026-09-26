import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, validAdminToken } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function authorized(req: NextRequest) {
  return validAdminToken(req.cookies.get(ADMIN_COOKIE)?.value)
}

function createSlug(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!authorized(req)) {
    return NextResponse.json(
      { error: 'Brak uprawnień' },
      { status: 401 }
    )
  }

  const { id } = await params
  const body = await req.json()

  const updatedBody = {
    ...body,
    ...(body.title
      ? { slug: createSlug(body.title.trim()) }
      : {})
  }

  const { data, error } = await supabaseAdmin()
    .from('songs')
    .update(updatedBody)
    .eq('id', id)
    .select('id, slug, title')
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({
    ok: true,
    data
  })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!authorized(req)) {
    return NextResponse.json(
      { error: 'Brak uprawnień' },
      { status: 401 }
    )
  }

  const { id } = await params

  const { error } = await supabaseAdmin()
    .from('songs')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({ ok: true })
}
