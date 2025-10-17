import { useEffect, useState } from 'react';
import { basket } from '../lib/api';

export default function BasketPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    const data = await basket.list();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  const onRemove = async (id: string) => { await basket.remove(id); reload(); };
  const onConfirm = async () => {
    try {
      const r = await basket.confirm();
      alert(`Order created: ${r.order_id} | Total: €${(r.total_cents/100).toFixed(2)}`);
      reload();
    } catch (e:any) { alert(e.message); }
  };

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="text-2xl font-bold mb-4">Basket</h1>
      {loading ? "Loading..." : (
        <>
          <ul className="space-y-2">
            {items.map(it => (
              <li key={it.listing_id} className="flex justify-between items-center border rounded-lg p-3">
                <div>
                  <div className="font-semibold">{it.title}</div>
                  <div className="text-sm text-gray-600">
                    {it.price_cents ? `€${(it.price_cents/100).toFixed(2)}` : 'Free'}
                  </div>
                </div>
                <button onClick={() => onRemove(it.listing_id)} className="text-sm px-3 py-2 rounded bg-rose-500 text-white">
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <button onClick={onConfirm} className="px-4 py-2 rounded bg-emerald-600 text-white">
              Confirm Purchase
            </button>
          </div>
        </>
      )}
    </div>
  );
}
