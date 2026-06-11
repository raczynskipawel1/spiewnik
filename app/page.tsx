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
  const [pass, setPass] = useState('')
  const [songs, setSongs] = useState<Song[]>([])
  const [q, setQ] = useState('')
  const [region, setRegion] = useState('Wszystkie')

  useEffect(() => {
    if (localStorage.getItem('songbook-ok') === '1') setOk(true)
  }, [])

  useEffect(() => {
    if (!ok) return
    supabase.from('songs').select('*').order('title').then(({ data }) => {
      setSongs((data || []) as Song[])
    })
  }, [ok])

  function login() {
    if (pass === process.env.NEXT_PUBLIC_SONGBOOK_PASSWORD) {
      localStorage.setItem('songbook-ok', '1')
      setOk(true)
    } else {
      alert('Złe hasło')
    }
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
      </div>

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
