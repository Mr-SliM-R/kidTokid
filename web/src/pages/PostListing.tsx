import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../lib/api';
import { CheckCircle2, ImagePlus, Loader2, Sparkles, Wand2 } from 'lucide-react';

type FormState = {
  title: string;
  category: string;
  price_cents: string;
  city: string;
  description: string;
  condition: string;
};

type ListingPayload = {
  title: string;
  category: string;
  city: string;
  description: string;
  price_cents: number | null;
  condition: string;
};

type UploadTarget = { blobName: string; uploadUrl: string; publicUrl: string };

const categories = [
  { id: 'clothing', label: 'Vetements' },
  { id: 'furniture', label: 'Mobilier' },
  { id: 'hygiene', label: 'Hygiene' },
  { id: 'feeding', label: 'Alimentation' },
  { id: 'mobility', label: 'Mobilite' },
  { id: 'safety', label: 'Securite' },
  { id: 'toys', label: 'Jouets' },
  { id: 'health', label: 'Sante' },
];

const conditions = ['New with tag', 'Like new', 'Good', 'Loved'];

export default function PostListing() {
  const [form, setForm] = useState<FormState>({
    title: '',
    category: 'clothing',
    price_cents: '',
    city: '',
    description: '',
    condition: 'Like new',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<'idle' | 'created' | 'uploaded'>('idle');
  const [successId, setSuccessId] = useState<string | null>(null);

  const readyToPost = useMemo(() => form.title.trim().length > 2 && !busy, [form.title, busy]);

  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onFiles = (nextFiles: FileList | null) => {
    const picked = Array.from(nextFiles || []);
    setFiles(picked);
    setPreviewUrls(picked.map((file) => URL.createObjectURL(file)));
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const resetForm = () => {
    setForm({
      title: '',
      category: 'clothing',
      price_cents: '',
      city: '',
      description: '',
      condition: 'Like new',
    });
    setFiles([]);
    setPreviewUrls([]);
    setStage('idle');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setStage('idle');
    try {
      const payload: ListingPayload = {
        title: form.title.trim(),
        category: form.category,
        city: form.city.trim(),
        description: form.description.trim(),
        price_cents: (() => {
          const clean = form.price_cents.trim();
          if (!clean) return null;
          const numeric = Number.parseFloat(clean.replace(',', '.'));
          return Number.isFinite(numeric) ? Math.round(numeric * 100) : null;
        })(),
        condition: form.condition,
      };

      const { listing_id } = await api<{ listing_id: string }>('/listings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setStage('created');

      if (files.length > 0) {
        const fileMeta = files.map((file) => ({
          ext: file.name.split('.').pop() || 'jpg',
        }));
        const uploadTargets = await api<UploadTarget[]>(
          `/listings/${listing_id}/upload-urls`,
          {
            method: 'POST',
            body: JSON.stringify({ files: fileMeta }),
          },
        );

        await Promise.all(
          uploadTargets.map((target, index) =>
            fetch(target.uploadUrl, {
              method: 'PUT',
              body: files[index],
              headers: {
                'x-ms-blob-type': 'BlockBlob',
                'x-ms-blob-content-type': files[index].type || 'application/octet-stream',
              },
            }).then((res) => {
              if (!res.ok) throw new Error('Upload failed');
            }),
          ),
        );

        await api<void>(`/listings/${listing_id}/images`, {
          method: 'POST',
          body: JSON.stringify({
            images: uploadTargets.map((target, index) => ({
              ...target,
              sort_order: index,
            })),
          }),
        });
        setStage('uploaded');
      }

      setSuccessId(listing_id);
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      alert(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-white">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="pill bg-brand-500/20 text-brand-100">Guided flow</span>
          <h2 className="mt-3 font-display text-3xl">Share a new KidToKid listing</h2>
          <p className="text-sm text-white/60">
            Upload polished photos, set mindful pricing, and publish in under two minutes.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
          <Sparkles className="h-4 w-4 text-brand-200" />
          Smart tips enabled
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-semibold text-white">Listing details</h3>
            <p className="text-xs text-white/50">
              Keep titles descriptive—brand, age range, or bundle info helps parents scan quickly.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-white/70 sm:col-span-2">
                Title
                <input
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  required
                  placeholder="Example: Wooden activity cube 6-18m"
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-brand-300 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-white/70">
                Category
                <select
                  name="category"
                  value={form.category}
                  onChange={onChange}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white focus:border-brand-300 focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-dusk text-white">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm text-white/70">
                Condition
                <select
                  name="condition"
                  value={form.condition}
                  onChange={onChange}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white focus:border-brand-300 focus:outline-none"
                >
                  {conditions.map((cond) => (
                    <option key={cond} value={cond} className="bg-dusk text-white">
                      {cond}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm text-white/70">
                Price (euros)
                <input
                  name="price_cents"
                  value={form.price_cents}
                  onChange={onChange}
                  placeholder="Ex: 24.00"
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-brand-300 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-white/70">
                City (optional)
                <input
                  name="city"
                  value={form.city}
                  onChange={onChange}
                  placeholder="Where can parents collect?"
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-brand-300 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-white/70 sm:col-span-2">
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  rows={4}
                  placeholder="Highlight what makes it special, note wear, add sizing tips."
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-brand-300 focus:outline-none"
                />
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-semibold text-white">Photos</h3>
            <p className="text-xs text-white/50">
              Capture details under natural light—covers, textures, hardware. Add up to 6 images.
            </p>
            <label
              className="mt-5 flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/20 bg-white/5 px-6 py-12 text-center text-sm text-white/60 transition hover:border-brand-300 hover:text-white"
            >
              <ImagePlus className="h-8 w-8 text-brand-200" />
              <div>
                <span className="font-semibold text-white">Drop images here</span>
                <p className="text-xs text-white/40">or click to browse from your device</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(event) => onFiles(event.target.files)}
                className="hidden"
              />
            </label>

            <AnimatePresence>
              {previewUrls.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 grid gap-3 sm:grid-cols-3"
                >
                  {previewUrls.map((src) => (
                    <div key={src} className="overflow-hidden rounded-2xl border border-white/10">
                      <img src={src} alt="Preview" className="h-32 w-full object-cover" />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
            <h3 className="font-semibold text-white">Publishing checklist</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3">
                <Wand2 className="mt-0.5 h-4 w-4 text-brand-200" />
                <span>Smart pricing hints adapt once the title and category are in place.</span>
              </li>
              <li className="flex items-start gap-3">
                <Wand2 className="mt-0.5 h-4 w-4 text-brand-200" />
                <span>Photos upload securely to Azure Blob Storage with temporary SAS links.</span>
              </li>
              <li className="flex items-start gap-3">
                <Wand2 className="mt-0.5 h-4 w-4 text-brand-200" />
                <span>After publishing, you can pin the listing to the homepage spotlight.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-semibold text-white">Progress</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
              <StatusRow label="Listing created" done={stage === 'created' || stage === 'uploaded'} />
              <StatusRow label="Images uploaded" done={stage === 'uploaded'} />
              <StatusRow label="Ready to publish" done={!!successId} />
            </div>

            <motion.button
              type="submit"
              disabled={!readyToPost}
              whileTap={{ scale: readyToPost ? 0.98 : 1 }}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading
                </>
              ) : (
                'Publish listing'
              )}
            </motion.button>

            <AnimatePresence>
              {successId && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-100"
                >
                  Listing {successId} published successfully!
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </form>
  );
}

function StatusRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <CheckCircle2
        className={done ? 'h-4 w-4 text-emerald-400' : 'h-4 w-4 text-white/30'}
      />
      <span className={done ? 'text-white text-sm' : 'text-white/60 text-sm'}>{label}</span>
    </div>
  );
}
