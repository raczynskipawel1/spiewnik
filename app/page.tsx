'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Song = {
  id: string
  title: string
  lyrics: string | null
  image_filename: string | null
  region: string | null
}

function norm(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export default function Home() {
  const [ok, setOk] = useState(false)
  const [admin, setAdmin] = useState(false)
  const [pass, setPass] = useState('')
  const [songs, setSongs] = useState<Song[]>([])
  const [q, setQ] = useState('')
  const [region, setRegion] = useState('Wszystkie')
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newLyrics, setNewLyrics] = useState('')
  const [newRegion, setNewRegion] = useState('')

  useEffect(() => {
    if (localStorage.getItem('songbook-ok') === '1') setOk(true)
    if (localStorage.getItem('songbook-admin') === '1') {
      setOk(true)
      setAdmin(true)
    }
  }, [])

  async function loadSongs() {
    const { data } = await supabase.from('songs').select('*').order('title')
    setSongs((data || []) as Song[])
  }

  useEffect(() => {
    if (ok) loadSongs()
  }, [ok])

  function login() {
    if (pass === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      localStorage.setItem('songbook-ok', '1')
      localStorage.setItem('songbook-admin', '1')
      setOk(true)
      setAdmin(true)
    } else if (pass === process.env.NEXT_PUBLIC_SONGBOOK_PASSWORD) {
      localStorage.setItem('songbook-ok', '1')
      setOk(true)
    } else {
      alert('Złe hasło')
    }
  }

  function logout() {
  localStorage.removeItem('songbook-ok')
  localStorage.removeItem('songbook-admin')
  setOk(false)
  setAdmin(false)
  setPass('')
}
  async function addSong() {
    if (!newTitle.trim()) return alert('Wpisz tytuł')

    const { error } = await supabase.from('songs').insert({
      title: newTitle.trim(),
      normalized_title: norm(newTitle.trim()),
      lyrics: newLyrics.trim(),
      region: newRegion.trim() || null,
      tags: ['ludowe'],
    })

    if (error) {
      alert('Błąd zapisu: ' + error.message)
      return
    }

    setNewTitle('')
    setNewLyrics('')
    setNewRegion('')
    setShowAdd(false)
    loadSongs()
  }

  const regions = useMemo(() => {
    const values = songs
      .map(s => s.region?.trim())
      .filter((v): v is string => Boolean(v))
    return ['Wszystkie', ...Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'pl'))]
  }, [songs])

  const filtered = useMemo(() => {
    const nq = norm(q)
    return songs.filter(s => {
      const matchesText =
        norm(s.title).includes(nq) ||
        norm(s.lyrics || '').includes(nq)

      const matchesRegion =
        region === 'Wszystkie' || s.region === region

      return matchesText && matchesRegion
    })
  }, [songs, q, region])

  if (!ok) return (
    <main className="login">
      <div className="loginbox">
        <h1>Śpiewnik Online</h1>
        <p className="muted">Wpisz hasło dostępu.</p>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
        <button onClick={login}>Wejdź</button>
      </div>
    </main>
  )

  return (
    <main className="page">
     <div className="header">
  <div>
    <div className="logo">Śpiewnik Online</div>
    <div className="sub">{filtered.length} z {songs.length} piosenek</div>
  </div>

  <div className="header-actions">
    {admin && (
      <button className="button" onClick={() => setShowAdd(!showAdd)}>
        ➕ Dodaj piosenkę
      </button>
    )}

    <button
      className="button secondary"
      onClick={logout}
    >
      Wyloguj
    </button>
  </div>
</div>

      {admin && showAdd && (
        <div className="detail addbox">
          <h2>Dodaj piosenkę</h2>
          <input className="search" placeholder="Tytuł" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          <input className="search" placeholder="Region, np. Lublin / Spisz / Kolędy" value={newRegion} onChange={e => setNewRegion(e.target.value)} />
          <textarea className="textarea" placeholder="Tekst piosenki" value={newLyrics} onChange={e => setNewLyrics(e.target.value)} />
          <button className="button" onClick={addSong}>Zapisz</button>
        </div>
      )}

      <input
        className="search"
        placeholder="Szukaj po tytule albo tekście..."
        value={q}
        onChange={e => setQ(e.target.value)}
      />

      <div className="filters">
        {regions.map(r => (
          <button
            key={r}
            className={region === r ? 'filter active' : 'filter'}
            onClick={() => setRegion(r)}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid">
        {filtered.map(song => (
          <Link key={song.id} href={`/song/${song.id}`} className="card">
            <h2>{song.title}</h2>
            <div className="muted">
              {song.region ? `${song.region} · ` : ''}
              {song.image_filename ? 'Zdjęcie dodane' : song.lyrics ? 'Tekst dodany' : 'Brak tekstu'}
            </div>
            <span className="button">Otwórz</span>
          </Link>
        ))}
      </div>
    </main>
  )
}
