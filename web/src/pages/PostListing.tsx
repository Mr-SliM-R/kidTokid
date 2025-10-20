import { useState } from 'react';
import { api } from '../lib/api';

type FormState = {
  title: string;
  category: string;
  price_cents: string;
  city: string;
  description: string;
};

type ListingPayload = {
  title: string;
  category: string;
  city: string;
  description: string;
  price_cents: number | null;
};

export default function PostListing() {
  const [form, setForm] = useState<FormState>({
    title: '', category: 'clothing', price_cents: '', city: '', description: ''
  });
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      // 1) create listing (metadata)
      const payload: ListingPayload = {
        title: form.title,
        category: form.category,
        city: form.city,
        description: form.description,
        price_cents: form.price_cents ? parseInt(form.price_cents) : null,
      };
      const { listing_id } = await api<{listing_id: string}>('/listings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // 2) get SAS upload URLs (one per selected file)
      const fileDescs = files.map(f => ({ ext: f.name.split('.').pop() || 'jpg' }));
      const uploadTargets = await api<Array<{blobName:string, uploadUrl:string, publicUrl:string}>>(
        `/listings/${listing_id}/upload-urls`,
        { method: 'POST', body: JSON.stringify({ files: fileDescs }) }
      );

      // 3) upload files with PUT directly to Blob
      await Promise.all(uploadTargets.map((t, i) =>
        fetch(t.uploadUrl, {
          method: 'PUT',
          body: files[i],
          headers: {
            'x-ms-blob-type': 'BlockBlob',
            'x-ms-blob-content-type': files[i].type || 'application/octet-stream',
          },
        }).then(r => {
          if (!r.ok) throw new Error('Upload failed');
        })
      ));

      // 4) commit images (store URLs in DB)
      await api<void>(`/listings/${listing_id}/images`, {
        method: 'POST',
        body: JSON.stringify({ images: uploadTargets.map((t, i) => ({ ...t, sort_order: i })) }),
      });

      setDoneId(listing_id);
      setForm({ title:'', category:'clothing', price_cents:'', city:'', description:'' });
      setFiles([]);
      alert('Listing posted!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error';
      alert(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Post a Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="title" value={form.title} onChange={onChange}
               placeholder="Title" className="w-full border p-2 rounded" required />
        <select name="category" value={form.category} onChange={onChange}
                className="w-full border p-2 rounded">
          <option value="clothing">Vêtements</option>
          <option value="furniture">Mobilier</option>
          <option value="hygiene">Hygiène</option>
          <option value="feeding">Alimentation</option>
          <option value="mobility">Mobilité</option>
          <option value="safety">Sécurité</option>
          <option value="toys">Jouets</option>
          <option value="health">Santé</option>
        </select>
        <input name="price_cents" value={form.price_cents} onChange={onChange}
               placeholder="Price (cents) — blank = Free"
               className="w-full border p-2 rounded" />
        <input name="city" value={form.city} onChange={onChange}
               placeholder="City" className="w-full border p-2 rounded" />
        <textarea name="description" value={form.description} onChange={onChange}
                  placeholder="Description" className="w-full border p-2 rounded" />
        <input type="file" multiple accept="image/*"
               onChange={(e)=> setFiles(Array.from(e.target.files || []))}
               className="w-full border p-2 rounded" />
        <button disabled={busy} className="px-4 py-2 rounded bg-emerald-600 text-white">
          {busy ? 'Posting…' : 'Post'}
        </button>
        {doneId && <p className="text-sm text-gray-600 mt-1">Listing ID: {doneId}</p>}
      </form>
    </div>
  );
}
