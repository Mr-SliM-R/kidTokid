import { useEffect, useState } from 'react'
import { api } from '../lib/api'

type Listing = { listing_id: string; title: string; price_cents: number|null; city?: string; is_free?: number; }

export default function Home() {
  const [items, setItems] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        // placeholder endpoint; we’ll wire it in Step 2
        const data = await api<Listing[]>('/listings?limit=12')
        setItems(data)
      } catch (e:any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="mx-auto max-w-6xl p-4">
      <h1 className="text-2xl font-bold mb-4">KidToKid — Nearby Listings</h1>
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map(it => (
          <div key={it.listing_id} className="border rounded-xl p-4 shadow-sm">
            <div className="h-36 bg-gray-100 rounded mb-3 flex items-center justify-center">Image</div>
            <div className="font-semibold">{it.title}</div>
            <div className="text-sm text-gray-600">
              {it.is_free ? 'Free' : (it.price_cents!=null ? (it.price_cents/100).toFixed(2)+' €' : '—')}
              {it.city ? ` · ${it.city}` : ''}
            </div>
            <button className="mt-3 rounded-lg px-3 py-2 bg-sky-500 text-white text-sm">Add to Basket</button>
          </div>
        ))}
      </div>
    </div>
  )
}
