'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
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
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
}

function regionKey(region: string | null) {
  const r = norm(region || '')
  if (r.includes('bilgor')) return 'bilgoraj'
  if (r.includes('chelm')) return 'chelm'
  if (r.includes('rzesz')) return 'rzeszow'
  if (r.includes('krak')) return 'krakow'
  if (r.includes('lowicz')) return 'lowicz'
  if (r.includes('nowy sacz') || r.includes('sadecz')) return 'nowy-sacz'
  if (r.includes('podhale')) return 'podhale'
  if (r.includes('powis')) return 'powisle'
  if (r.includes('podlas')) return 'podlasie'
  if (r.includes('spis')) return 'spisz'
  if (r.includes('slask')) return 'slask'
  if (r.includes('zywie')) return 'zywiec'
  if (r.includes('lublin') || r.includes('lubel')) return 'lublin'
  if (r.includes('ogolnopol')) return 'ogolnopolskie'
  return 'ogolnopolskie'
}

function typeKey(tag: string) {
  const t = norm(tag)
  if (t.includes('koled')) return 'koledy'
  if (t.includes('biesiad')) return 'biesiadne'
  if (t.includes('patriot')) return 'patriotyczne'
  if (t.includes('autokar')) return 'autokarowe'
  if (t.includes('ludow')) return 'ludowe'
  return 'inne'
}

function typeIconForTag(tag: string) {
  const t = typeKey(tag)
  if (t === 'koledy') return '✦'
  if (t === 'biesiadne') return '🍷'
  if (t === 'patriotyczne') return '🇵🇱'
  if (t === 'autokarowe') return '🚌'
  if (t === 'ludowe') return '✿'
  return '♪'
}

function parseTags(value: string) {
  return value
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
}

export default function SongPage() {
  const params = useParams()
  const searchParams = useSearchParams()

  const [song, setSong] = useState<Song | null>(null)
  const [admin, setAdmin] = useState(false)
  const [editing, setEditing] = useState(false)

  const [editedTitle, setEditedTitle] = useState('')
  const [editedRegion, setEditedRegion] = useState('')
  const [editedTags, setEditedTags] = useState('')
  const [editedLyrics, setEditedLyrics] = useState('')
  const [editedNotes, setEditedNotes] = useState('')

  useEffect(() => {
    fetch('/api/admin/session')
      .then(r => r.json())
      .then(x => {
        if (x.authenticated) {
          setAdmin(true)
          if (searchParams.get('edit') === '1') setEditing(true)
        }
      })
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

    const r = await fetch(`/api/admin/songs/${song.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })

    const result = await r.json()

    if (!r.ok) {
      alert('Błąd zapisu: ' + (result.error || r.statusText))
      return
    }

    setSong({ ...song, ...updated })
    setEditing(false)
    alert('Zapisano zmiany')
  }

  if (!song) return <main className="page">Ładowanie...</main>

  const img = imageUrl(song.image_filename)

  return (
    <main className="song-detail-shell">

      <header className="folk-header">
        <div className="folk-header-inner">
          <div className="brand-wrap">
            <div className="brand-logo-wrap">
              <img
                className="brand-logo"
                src="/logo-zpit-dabrowica.png"
                alt="Logo Zespołu Pieśni i Tańca Dąbrowica"
              />
            </div>

            <div className="brand-divider" />

            <div>
              <h1 className="brand-title">
                Zespół Pieśni i Tańca Dąbrowica
              </h1>
              <div className="brand-subtitle">Śpiewnik</div>
            </div>
          </div>

          <Link className="admin-link" href="/admin">
            ⚙ Panel administratora
          </Link>
        </div>
      </header>

      <div className="song-detail-content">

        <Link href="/" className="toplink">
          ← Wróć do listy
        </Link>

        <div className="detail">

          {!editing ? (
            <>
              <h1>{song.title}</h1>

              <div className="song-meta-tags">

                {song.region && (
                  <span className="region-badge">
                    <img
                      src={`/ornaments/${regionKey(song.region)}.png`}
                      alt=""
                      aria-hidden="true"
                    />
                    {song.region}
                  </span>
                )}

                {(song.tags || []).map(tag => (
                  <span
                    className={`folk-tag tag-${typeKey(tag)}`}
                    key={tag}
                  >
                    <span className="type-icon">
                      {typeIconForTag(tag)}
                    </span>
                    {tag}
                  </span>
                ))}

              </div>

              {admin && (
                <div className="song-admin-actions">
                  <button
                    className="button"
                    onClick={() => setEditing(true)}
                  >
                    ✏️ Edytuj piosenkę
                  </button>
                </div>
              )}

              {song.lyrics ? (
                <div className="lyrics">{song.lyrics}</div>
              ) : (
                <p className="muted">
                  Tekst do uzupełnienia później.
                </p>
              )}

              {song.notes && (
                <p className="muted">{song.notes}</p>
              )}

              {img && (
                <>
                  <h2 className="source-title">Oryginał</h2>
                  <img
                    src={img}
                    className="song-img"
                    alt={song.title}
                  />
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
      </div>
    </main>
  )
}
