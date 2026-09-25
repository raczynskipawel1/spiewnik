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

export default function Home() {
  const [ok, setOk] = useState(false)
  const [pass, setPass] = useState('')
  const [songs, setSongs] = useState<Song[]>([])
  const [q, setQ] = useState('')

  const [selectedTag, setSelectedTag] = useState('Wszystkie')
  const [selectedRegion, setSelectedRegion] = useState('Wszystkie')


  useEffect(() => {
    if (localStorage.getItem('songbook-ok') === '1') {
      setOk(true)
    }

  }, [])

  async function loadSongs() {
    const { data } = await supabase
      .from('songs')
      .select('*')
      .order('title')

    setSongs((data || []) as Song[])
  }

  useEffect(() => {
    if (ok) loadSongs()
  }, [ok])

  function login() {
    if (pass === process.env.NEXT_PUBLIC_SONGBOOK_PASSWORD) {
      localStorage.setItem('songbook-ok', '1')
      setOk(true)
    } else {
      alert('Złe hasło')
    }
  }

  function logout() {
    localStorage.removeItem('songbook-ok')
    setOk(false)
    setPass('')
  }


  const tags = useMemo(() => {
    const values = songs
      .flatMap(s => s.tags || [])
      .map(t => t.trim())
      .filter(Boolean)

    return [
      'Wszystkie',
      ...Array.from(new Set(values)).sort((a, b) =>
        a.localeCompare(b, 'pl')
      ),
    ]
  }, [songs])

  const regions = useMemo(() => {
    const values = songs
      .map(s => s.region?.trim())
      .filter((v): v is string => Boolean(v))

    return [
      'Wszystkie',
      ...Array.from(new Set(values)).sort((a, b) =>
        a.localeCompare(b, 'pl')
      ),
    ]
  }, [songs])

  const filtered = useMemo(() => {
    const nq = norm(q)

    return songs.filter(s => {
      const matchesText =
        norm(s.title).includes(nq) ||
        norm(s.lyrics || '').includes(nq) ||
        norm((s.tags || []).join(' ')).includes(nq)

      const matchesTag =
        selectedTag === 'Wszystkie' ||
        (s.tags || []).includes(selectedTag)

      const matchesRegion =
        selectedRegion === 'Wszystkie' ||
        s.region === selectedRegion

      return matchesText && matchesTag && matchesRegion
    })
  }, [songs, q, selectedTag, selectedRegion])

  if (!ok) {
    return (
      <main className="login">
        <div className="loginbox">
          <h1>Śpiewnik Online</h1>

          <p className="muted">
            Wpisz hasło dostępu.
          </p>

          <input
            type="password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e =>
              e.key === 'Enter' && login()
            }
          />

          <button onClick={login}>
            Wejdź
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="songbook-shell">
      <header className="folk-header">
        <div className="folk-header-inner">
          <div className="brand-wrap">
            <div className="brand-logo-wrap">
              <img className="brand-logo" src="/logo-zpit-dabrowica.png" alt="Logo Zespołu Pieśni i Tańca Dąbrowica" />
            </div>
            <div className="brand-divider" />
            <div>
              <h1 className="brand-title">Zespół Pieśni i Tańca Dąbrowica</h1>
              <div className="brand-subtitle">Śpiewnik</div>
            </div>
          </div>

          <Link className="admin-link" href="/admin">⚙ Panel administratora</Link>
        </div>
      </header>

      <section className="songbook-content">
        <input
          className="search search-main"
          placeholder="Szukaj po tytule, tekście albo tagach..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />

        <div className="filter-row folk-filters">
          <label>
            Typ
            <select value={selectedTag} onChange={e => setSelectedTag(e.target.value)}>
              {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </select>
          </label>
          <label>
            Region
            <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}>
              {regions.map(region => <option key={region} value={region}>{region}</option>)}
            </select>
          </label>
        </div>

        <div className="song-count">♪ {filtered.length} z {songs.length} piosenek</div>

        <div className="grid folk-grid">
          {filtered.map(song => (
            <Link key={song.id} href={`/song/${song.id}`} className="card folk-card">
              <div className="card-chevron">›</div>
              <h2>{song.title}</h2>
              {(song.tags || []).length > 0 && (
                <div className="folk-tags">
                  {song.tags?.map(tag => <span className="folk-tag" key={tag}>{tag}</span>)}
                </div>
              )}
              {song.region && <div className="card-region">⌖ {song.region}</div>}
              {song.lyrics && (
                <p className="lyrics-preview">{song.lyrics.replace(/\n+/g, ' ').slice(0, 115)}{song.lyrics.length > 115 ? '…' : ''}</p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </main>
  )}
