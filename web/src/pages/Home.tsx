import { motion } from 'framer-motion';
import { Baby, CalendarClock, Camera, Gift, Heart, Sparkles, Star } from 'lucide-react';

const quickStats = [
  { label: 'Parents Joined', value: '1.2k', icon: Heart, delta: '+48 this week' },
  { label: 'Listings Live', value: '326', icon: Gift, delta: '+18 today' },
  { label: 'Deliveries Moving', value: '42', icon: CalendarClock, delta: '4 arriving soon' },
];

const spotlight = [
  {
    title: 'Eco Essentials',
    copy: 'Planet-friendly picks from trusted parents—curated daily.',
    tag: 'Curated drop',
    accent: 'from-green-400/60 to-emerald-500/30',
  },
  {
    title: 'Seasonal Wardrobe',
    copy: 'Transitional outfits tailored for 0-4y, ready for fall adventures.',
    tag: 'Style update',
    accent: 'from-fuchsia-400/60 to-purple-500/30',
  },
];

const moments = [
  'Upload photos directly from your phone—auto polished.',
  'Share bundles and unlock extra visibility on the feed.',
  'Tap a delivery to see courier handoff eta in real time.',
];

export default function Home() {
  return (
    <div className="space-y-10 text-white">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid gap-6 lg:grid-cols-[1.3fr_1fr]"
      >
        <div className="glass-panel h-full bg-white/8 p-6">
          <div className="flex items-center gap-3 text-sm text-white/70">
            <Sparkles className="h-4 w-4 text-brand-300" />
            Parent-led marketplace crafted for re-loved essentials.
          </div>
          <h2 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">
            Share what little ones outgrow.
            <br /> Earn back closet space in style.
          </h2>
          <p className="mt-4 max-w-xl text-sm text-white/70 sm:text-base">
            KidToKid curates safe, high-quality gear with built-in logistics. Discover ready-to-ship
            treasures, bundle favourites, and keep items circulating with ease.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/80">
            <span className="pill bg-brand-500/20 text-brand-100">New: bundle insights</span>
            <span className="pill bg-white/10">Collections refreshed twice daily</span>
            <span className="pill bg-white/10">Carbon-neutral deliveries</span>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {quickStats.map(({ label, value, icon: Icon, delta }) => (
              <motion.div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center justify-between text-xs uppercase text-white/60">
                  {label}
                  <Icon className="h-4 w-4 text-brand-200" />
                </div>
                <p className="mt-2 font-display text-2xl">{value}</p>
                <p className="text-xs text-brand-200">{delta}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="glass-panel grid h-full gap-4 bg-white/8 p-6">
          {spotlight.map(({ title, copy, tag, accent }) => (
            <motion.article
              key={title}
              whileHover={{ scale: 1.02 }}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${accent}`}
            >
              <div className="absolute right-4 top-4 rounded-full bg-white/30 p-3 text-dusk">
                <Camera className="h-5 w-5" />
              </div>
              <div className="space-y-2 p-6">
                <span className="pill bg-white/30 text-dusk">{tag}</span>
                <h3 className="font-display text-2xl text-dusk">{title}</h3>
                <p className="text-sm text-dusk/80">{copy}</p>
              </div>
            </motion.article>
          ))}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3 text-sm text-white/70">
              <Baby className="h-5 w-5 text-brand-200" />
              <span>Spotlight: 0-24 months must-haves refreshed hourly.</span>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="glass-panel bg-white/6 p-6 sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-2xl">Trending Moments</h3>
          <span className="pill bg-brand-500/20 text-brand-100">Live community feed</span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {moments.map((item, idx) => (
            <motion.div
              key={item}
              whileHover={{ y: -6 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm leading-relaxed text-white/80"
            >
              <div className="mb-3 flex items-center gap-2 text-brand-200">
                <Star className="h-4 w-4" />
                <span>Story {idx + 1}</span>
              </div>
              {item}
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="glass-panel bg-white/6 p-6 sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl">Creator Boost</h3>
            <p className="text-sm text-white/60">
              Turn closet cleanouts into moments parents shop together.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-400"
          >
            Start a drop
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
            <h4 className="font-semibold text-white">Bundle & Earn</h4>
            <p className="mt-2">
              AI-powered pricing gives your bundle a highlight card—get 2x more basket adds within 24
              hours.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
            <h4 className="font-semibold text-white">Weekly Shout-outs</h4>
            <p className="mt-2">
              Feature your listings with gorgeous templates—share to socials in one tap and drive
              traffic back.
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
