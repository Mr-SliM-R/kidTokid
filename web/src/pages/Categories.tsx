import { useState } from 'react';
import { api } from '../lib/api';

type Category = {
  key: string;
  label: string;
  description: string;
};

type ListingSummary = {
  listing_id: string;
  title: string;
  price_cents: number | null;
  city?: string | null;
  is_free?: number;
  image_url?: string | null;
};

const categories: Category[] = [
  { key: 'clothing', label: 'Vetements', description: 'Clothing & fabrics' },
  { key: 'furniture', label: 'Mobilier', description: 'Furniture & nursery' },
  { key: 'hygiene', label: 'Hygiene', description: 'Diapering & hygiene' },
  { key: 'feeding', label: 'Alimentation', description: 'Feeding & nursing' },
  { key: 'mobility', label: 'Mobilite', description: 'Mobility & travel' },
  { key: 'safety', label: 'Securite', description: 'Safety & monitoring' },
  { key: 'toys', label: 'Jouets', description: 'Toys & fun' },
  { key: 'health', label: 'Sante', description: 'Health & wellness' },
];

export default function Categories() {
  const [selected, setSelected] = useState<Category | null>(null);
  const [items, setItems] = useState<ListingSummary[]>([]);

  const loadItems = async (cat: Category) => {
    setSelected(cat);
    const data = await api<ListingSummary[]>(`/listings?category=${cat.key}`);
    setItems(data);
  };

  if (!selected) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Categories</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => loadItems(c)}
              className="border rounded-xl p-4 shadow-sm hover:bg-gray-50 text-left"
            >
              <div className="font-semibold">{c.label}</div>
              <div className="text-sm text-gray-500">{c.description}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        onClick={() => setSelected(null)}
        className="text-sky-500 mb-3 text-sm"
      >
        ← Back to categories
      </button>
      <h2 className="text-xl font-bold mb-3">{selected.label}</h2>
      {items.length === 0 ? (
        <p>No items yet in this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.listing_id} className="border rounded-xl p-4 shadow-sm">
              <div className="h-36 bg-gray-100 rounded mb-3 flex items-center justify-center overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-gray-500">Image</span>
                )}
              </div>
              <div className="font-semibold">{item.title}</div>
              <div className="text-sm text-gray-600">
                {item.is_free
                  ? 'Free'
                  : item.price_cents != null
                  ? (item.price_cents / 100).toFixed(2) + ' EUR'
                  : 'N/A'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
