'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase, imageUrl } from '@/lib/supabase'

type Song = {
  id: string
  title: string
  lyrics: string | null
  notes: string | null
  image_filename: string | null
}

export default function SongPage() {
  const params = useParams()
  const [song, setSong] = useState<Song | null>(null)
  const [admin, setAdmin] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editedLyrics, setEditedLyrics] = useState('')

  useEffect(() => {
    if (localStorage.getItem('songbook-admin') === '1') {
      setAdmin(true)
    }
  }, [])

  useEffect(() => {
    supabase
      .from('songs')
      .select('*')
      .eq('id', params.id)
      .single()
      .then(({ data }) => {
        const loaded = data as Song
        setSong(loaded)
        setEditedLyrics(loaded?.lyrics || '')
      })
  }, [params.id])

  async function saveLyrics() {
    if (!song) return

    const { error } = await supabase
      .from('songs')
      .update({ lyrics: editedLyrics })
      .eq('id', song.id)

    if (error) {
      alert('Błąd zapisu: ' + error.message)
      return
    }

    setSong({ ...song, lyrics: editedLyrics })
    setEditing(false)
    alert('Zapisano tekst')
  }

  if (!song) return <main className="page">Ładowanie...</main>

  const img = imageUrl(song.image_filename)

  return (
    <main className="page">
      <Link href="/" className="toplink">← Wróć do listy</Link>

      <div className="detail">
        <h1>{song.title}</h1>

        {admin && !editing && (
          <button className="button" onClick={() => setEditing(true)}>
            ✏️ Edytuj tekst
          </button>
        )}

        {editing ? (
          <div className="editbox">
            <textarea
              className="textarea"
              value={editedLyrics}
              onChange={e => setEditedLyrics(e.target.value)}
            />

            <button className="button" onClick={saveLyrics}>
              💾 Zapisz
            </button>

            <button
              className="button secondary"
              style={{ marginLeft: '10px' }}
              onClick={() => {
                setEditedLyrics(song.lyrics || '')
                setEditing(false)
              }}
            >
              Anuluj
            </button>
          </div>
        ) : song.lyrics ? (
          <div className="lyrics">{song.lyrics}</div>
        ) : (
          <p className="muted">Tekst do uzupełnienia później.</p>
        )}

        {song.notes && <p className="muted">{song.notes}</p>}

        {img && (
          <>
            <h2 className="source-title">Oryginał</h2>
            <img src={img} className="song-img" alt={song.title} />
          </>
        )}
      </div>
    </main>
  )
}
