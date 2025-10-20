import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Grid3x3, Home, PackagePlus, ShoppingBag, Truck } from 'lucide-react';
import HomePage from './pages/Home';
import BasketPage from './pages/Basket';
import DeliveriesPage from './pages/Deliveries';
import CategoriesPage from './pages/Categories';
import PostListingPage from './pages/PostListing';

type TabKey = 'home' | 'categories' | 'basket' | 'deliveries' | 'post';

const tabs: Array<{
  id: TabKey;
  label: string;
  pretitle: string;
  blurb: string;
  icon: typeof Home;
}> = [
  {
    id: 'home',
    label: 'Overview',
    pretitle: 'Dashboard',
    blurb: 'See trending drops, curated picks, and parent tips at a glance.',
    icon: Home,
  },
  {
    id: 'categories',
    label: 'Marketplace',
    pretitle: 'Discover',
    blurb: 'Browse by age, need, and vibe with rich visuals & filters.',
    icon: Grid3x3,
  },
  {
    id: 'basket',
    label: 'Basket',
    pretitle: 'Checkout',
    blurb: 'Review saved gems and glide through the purchase flow.',
    icon: ShoppingBag,
  },
  {
    id: 'deliveries',
    label: 'Deliveries',
    pretitle: 'Logistics',
    blurb: 'Track each delivery milestone with live status chips.',
    icon: Truck,
  },
  {
    id: 'post',
    label: 'Post Listing',
    pretitle: 'Sell',
    blurb: 'Upload photos, set pricing, and publish in a guided flow.',
    icon: PackagePlus,
  },
];

export default function App() {
  const [tab, setTab] = useState<TabKey>('home');

  const activeTab = useMemo(() => tabs.find((t) => t.id === tab) ?? tabs[0], [tab]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-dusk text-white">
      <div className="pointer-events-none absolute inset-0 bg-aurora opacity-90" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6">
          <div className="glass-panel flex flex-col gap-6 px-6 py-7 sm:px-10 sm:py-9">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <span className="pill">{activeTab.pretitle}</span>
                <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl">
                  KidToKid Experience Hub
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-white/70 sm:text-base">
                  {activeTab.blurb}
                </p>
              </div>
              <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 sm:w-72">
                <span className="font-semibold text-white">Weekly Highlights</span>
                <p>✨ 8 new listings added</p>
                <p>🚚 4 deliveries in progress</p>
                <p>💬 12 saved searches buzzing</p>
              </div>
            </div>

            <nav className="flex flex-wrap gap-2 rounded-full border border-white/10 bg-white/5 p-2">
              {tabs.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === tab;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className="relative flex-1 min-w-[130px]"
                    type="button"
                  >
                    <div
                      className={`tab-btn ${
                        isActive
                          ? 'bg-white text-dusk shadow-glow'
                          : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="glass-panel w-full px-4 py-6 sm:px-8 sm:py-8"
            >
              {tab === 'home' && <HomePage />}
              {tab === 'categories' && <CategoriesPage />}
              {tab === 'basket' && <BasketPage />}
              {tab === 'deliveries' && <DeliveriesPage />}
              {tab === 'post' && <PostListingPage />}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="mx-auto mb-8 mt-auto w-full max-w-6xl px-4 text-xs text-white/50 sm:px-6">
          Crafted for KidToKid • Modern UI preview mode
        </footer>
      </div>
    </div>
  );
}
