import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../lib/api';
import { Clock, MapPin, PackageCheck, RefreshCw, Truck } from 'lucide-react';

type Delivery = {
  delivery_id: string;
  order_id: string;
  status: string;
  required_comment?: string | null;
  total_cents: number;
  created_at: string;
  updated_at: string;
};

const statusStyles: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: 'Awaiting pickup', bg: 'bg-white/10', text: 'text-white/70' },
  in_progress: { label: 'In progress', bg: 'bg-amber-500/20', text: 'text-amber-100' },
  delivered: { label: 'Delivered', bg: 'bg-emerald-500/20', text: 'text-emerald-100' },
  failed: { label: 'Failed', bg: 'bg-rose-500/20', text: 'text-rose-100' },
  canceled: { label: 'Canceled', bg: 'bg-white/10', text: 'text-white/50' },
};

const skeletonRows = Array.from({ length: 3 });

export default function DeliveriesPage() {
  const [items, setItems] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<Delivery[]>('/deliveries');
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id: string, status: string) => {
    const needsComment = ['delivered', 'canceled', 'failed'].includes(status);
    let comment = '';
    if (needsComment) {
      comment = window.prompt('Add a delivery note for the parent:')?.trim() ?? '';
      if (!comment) return;
    }
    await api<void>(`/deliveries/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, comment }),
    });
    load();
  };

  const stats = useMemo(() => {
    const totalValue = items.reduce((sum, item) => sum + (item.total_cents ?? 0), 0) / 100;
    return {
      active: items.filter((item) => item.status === 'in_progress').length,
      delivered: items.filter((item) => item.status === 'delivered').length,
      totalValue,
    };
  }, [items]);

  return (
    <div className="space-y-8 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="pill bg-brand-500/20 text-brand-100">Logistics view</span>
          <h2 className="mt-2 font-display text-3xl">Delivery operations</h2>
          <p className="text-sm text-white/60">
            Coordinate courier drops, pickups, and locker swaps with a glance.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Truck} label="Active routes" value={stats.active.toString()} />
        <StatCard icon={PackageCheck} label="Delivered" value={stats.delivered.toString()} />
        <StatCard icon={Clock} label="Value in transit" value={`€${stats.totalValue.toFixed(2)}`} />
      </section>

      {error && (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 px-6 py-4 text-sm text-rose-100">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {skeletonRows.map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="h-3 w-40 rounded-full bg-white/10" />
                  <div className="h-3 w-20 rounded-full bg-white/10" />
                </div>
                <div className="mt-4 h-3 w-3/4 rounded-full bg-white/5" />
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {items.map((delivery) => (
              <motion.article
                key={delivery.delivery_id}
                whileHover={{ translateY: -6 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">
                      Order {delivery.order_id.slice(0, 8).toUpperCase()}
                    </h3>
                    <p className="text-xs text-white/50">
                      Created {new Date(delivery.created_at).toLocaleDateString()} · Total €
                      {(delivery.total_cents / 100).toFixed(2)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusStyles[delivery.status]?.bg ?? 'bg-white/10'
                    } ${statusStyles[delivery.status]?.text ?? 'text-white/60'}`}
                  >
                    {statusStyles[delivery.status]?.label ?? delivery.status}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/60">
                  <MapPin className="h-3.5 w-3.5 text-brand-200" />
                  Updated {new Date(delivery.updated_at).toLocaleTimeString()}
                  {delivery.required_comment && (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-white/70">
                      Note: {delivery.required_comment}
                    </span>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <ActionButton onClick={() => setStatus(delivery.delivery_id, 'in_progress')}>
                    Mark in progress
                  </ActionButton>
                  <ActionButton
                    intent="success"
                    onClick={() => setStatus(delivery.delivery_id, 'delivered')}
                  >
                    Delivered
                  </ActionButton>
                  <ActionButton
                    intent="warning"
                    onClick={() => setStatus(delivery.delivery_id, 'failed')}
                  >
                    Failed
                  </ActionButton>
                  <ActionButton
                    intent="neutral"
                    onClick={() => setStatus(delivery.delivery_id, 'canceled')}
                  >
                    Cancel
                  </ActionButton>
                </div>
              </motion.article>
            ))}

            {items.length === 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/60">
                No deliveries yet. Listings move fast once they hit the spotlight feed.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between text-xs text-white/60">
        {label}
        <Icon className="h-4 w-4 text-brand-200" />
      </div>
      <p className="mt-3 font-display text-2xl text-white">{value}</p>
    </div>
  );
}

function ActionButton({
  children,
  intent = 'default',
  onClick,
}: {
  children: ReactNode;
  intent?: 'default' | 'success' | 'warning' | 'neutral';
  onClick: () => void;
}) {
  const styles =
    intent === 'success'
      ? 'bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30'
      : intent === 'warning'
      ? 'bg-rose-500/20 text-rose-100 hover:bg-rose-500/30'
      : intent === 'neutral'
      ? 'bg-white/10 text-white/70 hover:bg-white/15'
      : 'bg-brand-500/20 text-brand-100 hover:bg-brand-500/30';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${styles}`}
    >
      {children}
    </button>
  );
}
