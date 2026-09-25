'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Song = { id: string; title: string; lyrics: string | null; region: string | null; tags: string[] | null }

function norm(s: string) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') }

export default function AdminPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [songs, setSongs] = useState<Song[]>([])
  const [q, setQ] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newLyrics, setNewLyrics] = useState('')
  const [newRegion, setNewRegion] = useState('')
  const [newTag, setNewTag] = useState('ludowe')

  useEffect(() => {
    if (localStorage.getItem('songbook-admin') !== '1') { router.replace('/'); return }
    setReady(true)
  }, [router])

  async function loadSongs() {
    const { data, error } = await supabase.from('songs').select('id,title,lyrics,region,tags').order('title')
    if (error) return alert('Błąd pobierania: ' + error.message)
    setSongs((data || []) as Song[])
  }
  useEffect(() => { if (ready) loadSongs() }, [ready])

  const tags = useMemo(() => Array.from(new Set(songs.flatMap(s => s.tags || []).filter(Boolean))).sort((a,b) => a.localeCompare(b,'pl')), [songs])
  const filtered = useMemo(() => {
    const nq = norm(q)
    return songs.filter(s => norm(s.title).includes(nq) || norm(s.region || '').includes(nq) || norm((s.tags || []).join(' ')).includes(nq))
  }, [songs, q])

  async function addSong() {
    if (!newTitle.trim()) return alert('Wpisz tytuł')
    const { error } = await supabase.from('songs').insert({
      title: newTitle.trim(), normalized_title: norm(newTitle.trim()), lyrics: newLyrics.trim(),
      region: newRegion.trim() || null, tags: newTag.trim() ? [newTag.trim()] : []
    })
    if (error) return alert('Błąd zapisu: ' + error.message)
    setNewTitle(''); setNewLyrics(''); setNewRegion(''); setNewTag('ludowe'); setShowAdd(false); await loadSongs()
  }

  async function deleteSong(song: Song) {
    if (!confirm(`Usunąć piosenkę „${song.title}”?\n\nTej operacji nie można cofnąć.`)) return
    const { error } = await supabase.from('songs').delete().eq('id', song.id)
    if (error) return alert('Błąd usuwania: ' + error.message)
    setSongs(current => current.filter(s => s.id !== song.id))
  }

  if (!ready) return <main className="page">Ładowanie...</main>

  return <main className="page">
    <div className="admin-head">
      <div><Link href="/" className="toplink">← Wróć do śpiewnika</Link><h1>Panel administratora</h1><p className="muted">{songs.length} piosenek</p></div>
      <button className="button" onClick={() => setShowAdd(v => !v)}>➕ Dodaj piosenkę</button>
    </div>

    {showAdd && <div className="detail addbox">
      <h2>Dodaj piosenkę</h2>
      <input className="search" placeholder="Tytuł" value={newTitle} onChange={e=>setNewTitle(e.target.value)} />
      <input className="search admin-input" placeholder="Region" value={newRegion} onChange={e=>setNewRegion(e.target.value)} />
      <select className="add-type-select" value={newTag} onChange={e=>setNewTag(e.target.value)}>
        {tags.length ? tags.map(t=><option key={t}>{t}</option>) : <option>ludowe</option>}
      </select>
      <textarea className="textarea" placeholder="Tekst piosenki" value={newLyrics} onChange={e=>setNewLyrics(e.target.value)} />
      <button className="button" onClick={addSong}>💾 Zapisz piosenkę</button>
      <button className="button secondary admin-cancel" onClick={()=>setShowAdd(false)}>Anuluj</button>
    </div>}

    <input className="search" placeholder="Szukaj piosenki, regionu lub typu..." value={q} onChange={e=>setQ(e.target.value)} />
    <div className="admin-list">
      {filtered.map(song => <div className="admin-row" key={song.id}>
        <div className="admin-song-info"><strong>{song.title}</strong><span>{song.region || 'Bez regionu'}{(song.tags || []).length ? ` · ${(song.tags || []).join(', ')}` : ''}</span></div>
        <div className="admin-row-actions">
          <Link className="button secondary compact" href={`/song/${song.id}`}>Podgląd</Link>
          <Link className="button compact" href={`/song/${song.id}?edit=1`}>✏️ Edytuj</Link>
          <button className="button danger compact" onClick={()=>deleteSong(song)}>🗑️ Usuń</button>
        </div>
      </div>)}
    </div>
  </main>
}
