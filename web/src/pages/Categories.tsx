import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../lib/api';
import { Baby, Bed, Droplet, Leaf, Palette, Shield, Shirt, ToyBrick } from 'lucide-react';
import clsx from 'clsx';

type ListingSummary = {
  listing_id: string;
  title: string;
  price_cents: number | null;
  city?: string | null;
  is_free?: number;
  image_url?: string | null;
};

type CategoryCard = {
  key: string;
  label: string;
  description: string;
  gradient: string;
  icon: ComponentType<{ className?: string }>;
};

const categories: CategoryCard[] = [
  { key: 'clothing', label: 'Vetements', description: 'Layered looks & cozy basics', gradient: 'from-pink-400/30 to-purple-500/20', icon: Shirt },
  { key: 'furniture', label: 'Mobilier', description: 'Cribs, changers & space savers', gradient: 'from-teal-400/30 to-emerald-500/20', icon: Bed },
  { key: 'hygiene', label: 'Hygiene', description: 'Bath time & skincare picks', gradient: 'from-sky-400/30 to-cyan-500/20', icon: Droplet },
  { key: 'feeding', label: 'Alimentation', description: 'Meals, prep & bottle gear', gradient: 'from-amber-400/30 to-orange-500/20', icon: Baby },
  { key: 'mobility', label: 'Mobilite', description: 'Strollers & travel-ready seats', gradient: 'from-lime-400/30 to-green-500/20', icon: Leaf },
  { key: 'safety', label: 'Securite', description: 'Monitors & safety essentials', gradient: 'from-indigo-400/30 to-blue-500/20', icon: Shield },
  { key: 'toys', label: 'Jouets', description: 'Playtime favorites & sets', gradient: 'from-rose-400/30 to-red-500/20', icon: ToyBrick },
  { key: 'health', label: 'Sante', description: 'Care kits & well-being', gradient: 'from-violet-400/30 to-fuchsia-500/20', icon: Palette },
];

const skeletonCards = Array.from({ length: 6 });

export default function Categories() {
  const [selected, setSelected] = useState<CategoryCard | null>(null);
  const [items, setItems] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalValue = useMemo(
    () =>
      items.reduce((sum, item) => sum + (item.price_cents ?? 0), 0) / 100,
    [items],
  );

  const loadItems = async (catKey: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<ListingSummary[]>(`/listings?category=${catKey}`);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selected) return;
    loadItems(selected.key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.key]);

  return (
    <div className="flex flex-col gap-8">
      {!selected && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 md:grid-cols-2"
        >
          {categories.map((card) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.key}
                type="button"
                onClick={() => setSelected(card)}
                whileHover={{ y: -6 }}
                className={clsx(
                  'glass-panel flex h-full items-center gap-5 rounded-3xl border border-white/10 p-6 text-left transition',
                  'bg-gradient-to-r',
                  card.gradient,
                )}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/30 text-dusk">
                  <Icon className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-xl text-dusk">{card.label}</h3>
                  <p className="text-sm text-dusk/70">{card.description}</p>
                </div>
              </motion.button>
            );
          })}
        </motion.section>
      )}

      {selected && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-sm text-white/60 transition hover:text-white"
              >
                ← Back to categories
              </button>
              <h2 className="mt-2 font-display text-3xl">{selected.label}</h2>
              <p className="text-sm text-white/60">{selected.description}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/70">
              <p className="text-xs uppercase tracking-wide text-white/40">Collection Insight</p>
              <p className="text-lg font-semibold text-white">
                {items.length} listings · €{totalValue.toFixed(2)} total value
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-6 py-4 text-sm text-rose-100">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
              >
                {skeletonCards.map((_, idx) => (
                  <div
                    key={idx}
                    className="animate-pulse rounded-3xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="mb-4 h-40 rounded-2xl bg-white/10" />
                    <div className="h-3 rounded-full bg-white/15" />
                    <div className="mt-3 h-3 w-1/2 rounded-full bg-white/10" />
                    <div className="mt-6 flex justify-between">
                      <div className="h-3 w-16 rounded-full bg-white/10" />
                      <div className="h-3 w-12 rounded-full bg-white/10" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
              >
                {items.map((item, idx) => (
                  <motion.article
                    key={item.listing_id}
                    whileHover={{ translateY: -8 }}
                    className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5"
                  >
                    <div className="relative h-44 w-full overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="h-full w-full object-cover transition duration-500 hover:scale-105"
                          loading={idx < 3 ? 'eager' : 'lazy'}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-white/5 text-sm text-white/50">
                          Preview soon
                        </div>
                      )}
                      <span className="absolute right-4 top-4 rounded-full bg-dusk/80 px-3 py-1 text-xs font-semibold text-white">
                        {item.is_free ? 'Free' : item.price_cents ? `€${(item.price_cents / 100).toFixed(2)}` : 'Ask'}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <p className="text-xs uppercase tracking-wide text-white/40">
                        {item.city || 'Local pickup • flexible'}
                      </p>
                      <div className="mt-auto flex items-center justify-between text-xs text-white/50">
                        <span>Listing #{idx + 1}</span>
                        <span>Tap for details</span>
                      </div>
                    </div>
                  </motion.article>
                ))}
                {items.length === 0 && (
                  <div className="col-span-full rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/60">
                    No listings yet. Try another category or publish your first find!
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
