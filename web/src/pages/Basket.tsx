import { motion } from 'framer-motion';
import { MinusCircle, PlusCircle, Sparkles, Truck } from 'lucide-react';

type BasketItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  size: string;
  eta: string;
};

const mockItems: BasketItem[] = [
  {
    id: 1,
    name: 'Corduroy overall set 18-24m',
    price: 18.5,
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=500&q=80',
    size: '18-24 months',
    eta: 'Ships in 1-2 days',
  },
  {
    id: 2,
    name: 'Montessori wooden rainbow stacker',
    price: 12,
    image: 'https://images.unsplash.com/photo-1549998638-ec08f93b01b6?auto=format&fit=crop&w=500&q=80',
    size: 'All ages',
    eta: 'Local pickup',
  },
  {
    id: 3,
    name: 'Story time bundle (3 books)',
    price: 9.5,
    image: 'https://images.unsplash.com/photo-1490300471924-1c81fc1b4b83?auto=format&fit=crop&w=500&q=80',
    size: '3-6 years',
    eta: 'Ships tomorrow',
  },
];

export default function Basket() {
  const total = mockItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="space-y-8 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="pill bg-brand-500/20 text-brand-100">Reserved for you</span>
          <h2 className="mt-2 font-display text-3xl">Basket, ready to confirm</h2>
          <p className="text-sm text-white/60">
            These pieces are on hold for 30 minutes. Adjust quantities and select delivery style.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
          <Sparkles className="h-4 w-4 text-brand-200" />
          Bundles earn free courier drop
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="space-y-4">
          {mockItems.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 md:flex-row md:items-center"
            >
              <div className="h-32 w-full overflow-hidden rounded-2xl md:h-28 md:w-40">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-white">{item.name}</h3>
                    <p className="text-xs uppercase tracking-wide text-white/40">{item.size}</p>
                  </div>
                  <span className="rounded-full bg-brand-500/20 px-3 py-1 text-sm font-semibold text-brand-100">
                    €{item.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                  <Truck className="h-3.5 w-3.5 text-brand-200" />
                  {item.eta}
                </div>
                <div className="flex items-center gap-4 text-sm text-white/70">
                  <button type="button" className="flex items-center gap-1 text-white/60 hover:text-white">
                    <MinusCircle className="h-4 w-4" /> Remove
                  </button>
                  <button type="button" className="flex items-center gap-1 text-white/60 hover:text-white">
                    <PlusCircle className="h-4 w-4" /> Save for later
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </section>

        <aside className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
          <h3 className="font-semibold text-white">Checkout summary</h3>
          <div className="space-y-3">
            <Row label="Subtotal" value={`€${total.toFixed(2)}`} />
            <Row label="Eco logistics" value="€3.90" />
            <Row label="Marketplace fee" value="€1.80" />
            <Row label="Credits applied" value="- €5.00" />
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-white">
            <span>Total due</span>
            <span className="text-lg font-semibold">
              €{(total + 3.9 + 1.8 - 5).toFixed(2)}
            </span>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="mt-6 w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-400"
          >
            Continue to delivery
          </motion.button>
          <p className="text-xs text-white/40">
            Delivery windows adjust after you confirm address and drop preference.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}
