export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071/api';

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers||{}) }});
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const basket = {
  list: () => api<any[]>('/basket'),
  add: (id: string) => api<void>(`/basket/${id}`, { method: 'POST' }),
  remove: (id: string) => api<void>(`/basket/${id}`, { method: 'DELETE' }),
  confirm: () => api<{order_id:string,total_cents:number}>('/orders/confirm', { method: 'POST' }),
};

export const favorites = {
  list: () => api<any[]>('/favorites'),
  add: (id: string) => api<void>(`/favorites/${id}`, { method: 'POST' }),
  remove: (id: string) => api<void>(`/favorites/${id}`, { method: 'DELETE' }),
};

export const savedSearches = {
  list: () => api<any[]>('/saved-searches'),
  create: (payload: any) => api<{saved_search_id:string}>('/saved-searches', {
    method: 'POST', body: JSON.stringify(payload)
  }),
  run: (sid: string) => api<{results:any[],query:any}>(`/saved-searches/${sid}/run`, { method: 'POST' }),
  toggle: (sid: string) => api<void>(`/saved-searches/${sid}/toggle`, { method: 'POST' }),
};
