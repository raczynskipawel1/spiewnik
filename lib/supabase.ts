import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function imageUrl(filename?: string | null) {
  if (!filename) return null
  const { data } = supabase.storage.from('song-images').getPublicUrl(filename)
  return data.publicUrl
}
