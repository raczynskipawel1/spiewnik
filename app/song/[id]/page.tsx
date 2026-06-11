'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase, imageUrl } from '@/lib/supabase'

type Song = { id: string; title: string; lyrics: string | null; notes: string | null; image_filename: string | null }

export default function SongPage() {
  const params = useParams()
  const [song, setSong] = useState<Song | null>(null)

  useEffect(() => {
    supabase.from('songs').select('*').eq('id', params.id).single().then(({ data }) => setSong(data as Song))
  }, [params.id])

  if (!song) return <main className="page">Ładowanie...</main>

  const img = imageUrl(song.image_filename)

  return (
    <main className="page">
      <Link href="/" className="toplink">← Wróć do listy</Link>
      <div className="detail">
        <h1>{song.title}</h1>
        {img && <img src={img} className="song-img" alt={song.title} />}
        {song.lyrics ? <div className="lyrics">{song.lyrics}</div> : <p className="muted">Tekst do uzupełnienia później.</p>}
        {song.notes && <p className="muted">{song.notes}</p>}
      </div>
    </main>
  )
}
