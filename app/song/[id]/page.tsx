'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function OldSongRedirect() {
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    const id = Array.isArray(params.id)
      ? params.id[0]
      : params.id

    if (!id) return

    supabase
      .from('songs')
      .select('slug')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data?.slug) {
          router.replace('/')
          return
        }

        router.replace(`/piosenka/${data.slug}`)
      })
  }, [params.id, router])

  return (
    <main className="page">
      Przekierowanie...
    </main>
  )
}
