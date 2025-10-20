import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type Delivery = {
  delivery_id: string;
  order_id: string;
  status: string;
  required_comment?: string | null;
  total_cents: number;
  created_at: string;
  updated_at: string;
};

export default function DeliveriesPage() {
  const [items, setItems] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await api<Delivery[]>('/deliveries');
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const comment = ['delivered','canceled','failed'].includes(status)
      ? prompt('Enter required comment:')
      : '';
    if (status !== 'in_progress' && !comment) return; // enforce comment
    await api<void>(`/deliveries/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, comment }),
    });
    load();
  };

  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="text-2xl font-bold mb-4">Deliveries</h1>
      <ul className="space-y-3">
        {items.map(d => (
          <li key={d.delivery_id} className="border rounded-lg p-3">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">Order {d.order_id.slice(0,8)}…</div>
                <div className="text-sm text-gray-600">Status: {d.status} · Total €{(d.total_cents/100).toFixed(2)}</div>
                {d.required_comment && <div className="text-sm mt-1">Comment: {d.required_comment}</div>}
              </div>
              <div className="flex gap-2">
                <button onClick={()=>setStatus(d.delivery_id,'in_progress')} className="px-3 py-1 rounded bg-amber-500 text-white text-sm">Start</button>
                <button onClick={()=>setStatus(d.delivery_id,'delivered')} className="px-3 py-1 rounded bg-emerald-600 text-white text-sm">Delivered</button>
                <button onClick={()=>setStatus(d.delivery_id,'failed')} className="px-3 py-1 rounded bg-rose-600 text-white text-sm">Failed</button>
                <button onClick={()=>setStatus(d.delivery_id,'canceled')} className="px-3 py-1 rounded bg-gray-500 text-white text-sm">Cancel</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
