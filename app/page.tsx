'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Song = { id: string; title: string; lyrics: string | null; image_filename: string | null }

function norm(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export default function Home() {
  const [ok, setOk] = useState(false)
  const [pass, setPass] = useState('')
  const [songs, setSongs] = useState<Song[]>([])
  const [q, setQ] = useState('')

  useEffect(() => { if (localStorage.getItem('songbook-ok') === '1') setOk(true) }, [])

  useEffect(() => {
    if (!ok) return
    supabase.from('songs').select('*').order('title').then(({ data }) => setSongs((data || []) as Song[]))
  }, [ok])

  function login() {
    if (pass === process.env.NEXT_PUBLIC_SONGBOOK_PASSWORD) {
      localStorage.setItem('songbook-ok', '1')
      setOk(true)
    } else alert('Złe hasło')
  }

  const filtered = useMemo(() => {
    const nq = norm(q)
    return songs.filter(s => norm(s.title).includes(nq) || norm(s.lyrics || '').includes(nq))
  }, [songs, q])

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
        <div className="logo">Śpiewnik Online</div>
        <div className="sub">{songs.length} piosenek w bazie</div>
      </div>
      <input className="search" placeholder="Szukaj po tytule albo tekście..." value={q} onChange={e => setQ(e.target.value)} />
      <div className="grid">
        {filtered.map(song => (
          <Link key={song.id} href={`/song/${song.id}`} className="card">
            <h2>{song.title}</h2>
            <div className="muted">{song.image_filename ? 'Zdjęcie dodane' : 'Brak zdjęcia'}</div>
            <span className="button">Otwórz</span>
          </Link>
        ))}
      </div>
    </main>
  )
}
