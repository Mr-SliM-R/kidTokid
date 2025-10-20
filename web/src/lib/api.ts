export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071/api';

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  if (res.status === 204 || res.status === 205 || res.status === 304) {
    return undefined as T;
  }
  const contentLength = res.headers.get('content-length');
  if (contentLength === '0') {
    return undefined as T;
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json() as Promise<T>;
  }
  const text = await res.text();
  if (!text) {
    return undefined as T;
  }
  return text as unknown as T;
}

export const basket = {
  add: (id: string) => api<void>(`/basket/${id}`, { method: 'POST' }),
  remove: (id: string) => api<void>(`/basket/${id}`, { method: 'DELETE' }),
};

export const favorites = {
  add: (id: string) => api<void>(`/favorites/${id}`, { method: 'POST' }),
  remove: (id: string) => api<void>(`/favorites/${id}`, { method: 'DELETE' }),
};
