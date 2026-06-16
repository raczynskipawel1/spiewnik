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
  region: string | null
  tags: string[] | null
}

function norm(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function parseTags(value: string) {
  return value
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
}

export default function SongPage() {
  const params = useParams()
  const [song, setSong] = useState<Song | null>(null)
  const [admin, setAdmin] = useState(false)
  const [editing, setEditing] = useState(false)

  const [editedTitle, setEditedTitle] = useState('')
  const [editedRegion, setEditedRegion] = useState('')
  const [editedTags, setEditedTags] = useState('')
  const [editedLyrics, setEditedLyrics] = useState('')
  const [editedNotes, setEditedNotes] = useState('')

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
        setEditedTitle(loaded?.title || '')
        setEditedRegion(loaded?.region || '')
        setEditedTags((loaded?.tags || []).join(', '))
        setEditedLyrics(loaded?.lyrics || '')
        setEditedNotes(loaded?.notes || '')
      })
  }, [params.id])

  async function saveSong() {
    if (!song) return
    if (!editedTitle.trim()) return alert('Tytuł nie może być pusty')

    const updated = {
      title: editedTitle.trim(),
      normalized_title: norm(editedTitle.trim()),
      region: editedRegion.trim() || null,
      tags: parseTags(editedTags),
      lyrics: editedLyrics,
      notes: editedNotes.trim() || null,
    }

    const { error } = await supabase
      .from('songs')
      .update(updated)
      .eq('id', song.id)

    if (error) {
      alert('Błąd zapisu: ' + error.message)
      return
    }

    setSong({ ...song, ...updated })
    setEditing(false)
    alert('Zapisano zmiany')
  }

  if (!song) return <main className="page">Ładowanie...</main>

  const img = imageUrl(song.image_filename)

  return (
    <main className="page">
      <Link href="/" className="toplink">← Wróć do listy</Link>

      <div className="detail">
        {!editing ? (
          <>
            <h1>{song.title}</h1>

            <p className="muted">
              {song.region ? `${song.region}` : 'Bez regionu'}
              {(song.tags || []).length > 0 ? ` · ${song.tags?.join(', ')}` : ''}
            </p>

            {admin && (
              <button className="button" onClick={() => setEditing(true)}>
                ✏️ Edytuj piosenkę
              </button>
            )}

            {song.lyrics ? (
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
          </>
        ) : (
          <div className="editbox">
            <h1>Edytuj piosenkę</h1>

            <input
              className="search"
              placeholder="Tytuł"
              value={editedTitle}
              onChange={e => setEditedTitle(e.target.value)}
            />

            <input
              className="search"
              placeholder="Region"
              value={editedRegion}
              onChange={e => setEditedRegion(e.target.value)}
            />

            <input
              className="search"
              placeholder="Tagi po przecinku"
              value={editedTags}
              onChange={e => setEditedTags(e.target.value)}
            />

            <textarea
              className="textarea"
              placeholder="Tekst piosenki"
              value={editedLyrics}
              onChange={e => setEditedLyrics(e.target.value)}
            />

            <textarea
              className="textarea small"
              placeholder="Notatki"
              value={editedNotes}
              onChange={e => setEditedNotes(e.target.value)}
            />

            <button className="button" onClick={saveSong}>
              💾 Zapisz
            </button>

            <button
              className="button secondary"
              style={{ marginLeft: '10px' }}
              onClick={() => {
                setEditedTitle(song.title)
                setEditedRegion(song.region || '')
                setEditedTags((song.tags || []).join(', '))
                setEditedLyrics(song.lyrics || '')
                setEditedNotes(song.notes || '')
                setEditing(false)
              }}
            >
              Anuluj
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
