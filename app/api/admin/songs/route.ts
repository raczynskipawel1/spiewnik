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

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json(
      { error: 'Brak uprawnień' },
      { status: 401 }
    )
  }

  const body = await req.json()

  if (!body.title?.trim()) {
    return NextResponse.json(
      { error: 'Tytuł nie może być pusty' },
      { status: 400 }
    )
  }

  const slug = createSlug(body.title.trim())

  const { data, error } = await supabaseAdmin()
    .from('songs')
    .insert({
      ...body,
      slug
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({ data })
}
