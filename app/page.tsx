'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Song = {
  id: string
  slug: string
  title: string
  lyrics: string | null
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
  if (r.includes('zamosc')) return 'zamosc'
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

function RegionOrnament({ region }: { region: string | null }) {
  const key = regionKey(region)
  return <img
    className="region-ornament"
    src={`/ornaments/${key}.png`}
    alt=""
    aria-hidden="true"
  />
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
            <Link key={song.id} href={`/song/${song.id}`} className={`card folk-card region-${regionKey(song.region)}`}>
              <div className="card-chevron">›</div>
              <RegionOrnament region={song.region} />
              <h2>{song.title}</h2>
              {(song.tags || []).length > 0 && (
                <div className="folk-tags">
                  {song.tags?.map((tag) => <span className={`folk-tag tag-${typeKey(tag)}`} key={tag}><span className="type-icon">{typeIconForTag(tag)}</span>{tag}</span>)}
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
