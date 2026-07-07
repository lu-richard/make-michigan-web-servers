import { useEffect, useMemo, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../lib/supabase'
import type { MakerspaceCardData } from '../types/types'
import labels from '../constants/labels'

interface Props {
  // if callers supply makerspaces, the component will use that instead of fetching
  makerspaces?: MakerspaceCardData[] | null
  // pass the full makerspace object so parent can read name / other fields
  onSelect?: (makerspace: MakerspaceCardData) => void
  className?: string
}

export default function Sidebar({ makerspaces: propsMakerspaces, onSelect, className }: Props) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const [remoteMakerspaces, setRemoteMakerspaces] = useState<MakerspaceCardData[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate();

  // debounce input to avoid querying on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 400)
    return () => clearTimeout(t)
  }, [query])

  // fetch makerspaces only when parent didn't supply them
  useEffect(() => {
    if (propsMakerspaces !== undefined) return // parent provided data — don't fetch
    let mounted = true
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        let q = supabase.schema('private').from('view_makerspace_cards').select('*')
        if (debouncedQuery) {
          q = q.textSearch('fts', debouncedQuery, { type: 'websearch', config: 'english' })
        }
        q = q.order('makerspace_name', { ascending: true }).limit(100)
        const { data, error: err } = await q
        if (!mounted) return
        if (err) {
          setError(String((err as any).message ?? err))
          setRemoteMakerspaces([])
        } else {
          setRemoteMakerspaces((data as MakerspaceCardData[]) ?? [])
        }
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message ?? String(e))
        setRemoteMakerspaces([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void fetchData()
    return () => {
      mounted = false
    }
  }, [debouncedQuery, propsMakerspaces])

  // prefer prop data when provided, otherwise remote data
  const makerspaces = propsMakerspaces !== undefined ? propsMakerspaces : remoteMakerspaces

  // debug: helpful during development — remove or gate behind env flag in prod
  // eslint-disable-next-line no-console
  console.debug('SkillTreeSidebar render', { propsMakerspaces, remoteMakerspaces, debouncedQuery })

  const list = useMemo(() => {
    if (!makerspaces) return []
    const q = (debouncedQuery ?? '').toLowerCase()
    if (!q) return makerspaces
    return makerspaces.filter((m) => {
      const name = String(m.makerspace_name ?? '').toLowerCase()
      const building = String(m.building ?? '').toLowerCase()
      const themes = Array.isArray(m.themes) ? m.themes.join(' ').toLowerCase() : ''
      return name.includes(q) || building.includes(q) || themes.includes(q)
    })
  }, [makerspaces, debouncedQuery])

  const handleKey = (e: KeyboardEvent, m: MakerspaceCardData) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect?.(m)
    }
  }

  return (
    <aside
      className={className}
      style={{
        width: 320,
        padding: 12,
        borderRight: '1px solid #e6e6e6',
        height: '100vh',           // fill viewport vertically
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        backgroundColor: '#f0f0f0',
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <input
          aria-label="Search makerspaces"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search makerspaces..."
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: 6,
            border: '1px solid #ccc',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ overflowY: 'auto' }}>
        {loading && <div style={{ color: '#666' }}>Loading…</div>}
        {!loading && error && <div style={{ color: 'crimson' }}>{error}</div>}
        {!loading && !error && list.length === 0 && <div style={{ color: '#666' }}>No makerspaces found</div>}

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {list.map((m) => (
            <li
              key={m.makerspace_id}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => handleKey(e, m)}
              onClick={() => {
                onSelect?.(m);
                navigate("/dashboard/trainings");
              }}
              style={{
                padding: 10,
                borderRadius: 6,
                marginBottom: 8,
                cursor: 'pointer',
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                background: '#fff',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.02) inset',
                outline: 'none',
              }}
            >
              <div style={{ width: 48, height: 48, flex: '0 0 48px', borderRadius: 4, overflow: 'hidden', background: '#f2f2f2' }}>
                {m.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.cover_image} alt={m.makerspace_name ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 12 }}>
                    MS
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{m.makerspace_name}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{m.building ?? ''}</div>
                {m.themes && m.themes.length > 0 && (
                  <div style={{ marginTop: 6, fontSize: 11, color: '#444' }}>{m.themes.map((tag) => labels[tag as keyof typeof labels]).join(', ')}</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}