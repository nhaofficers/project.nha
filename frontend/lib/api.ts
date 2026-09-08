'use client';
const BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';

export function accessToken() { return typeof window === 'undefined' ? null : sessionStorage.getItem('nha_access'); }
export function currentUser() {
  try {
    const token = accessToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]!.replaceAll('-', '+').replaceAll('_', '/'))) as { email: string; permissions: string[] };
    return payload;
  } catch { return null; }
}
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = accessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  let response = await fetch(`${BASE}${path}`, { ...options, headers, credentials: 'include' });
  if (response.status === 401 && !path.startsWith('/auth/')) {
    const refreshed = await fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (refreshed.ok) { const data = await refreshed.json() as { accessToken: string }; sessionStorage.setItem('nha_access', data.accessToken); headers.set('Authorization', `Bearer ${data.accessToken}`); response = await fetch(`${BASE}${path}`, { ...options, headers, credentials: 'include' }); }
  }
  if (!response.ok) { const error = await response.json().catch(() => ({ message: response.statusText })) as { message?: string | string[] }; throw new Error(Array.isArray(error.message) ? error.message.join(', ') : error.message ?? 'Request failed'); }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function downloadApi(path: string, options: RequestInit = {}, fallbackName = 'download') {
  const headers = new Headers(options.headers);
  const token = accessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${BASE}${path}`, { ...options, headers, credentials: 'include' });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText })) as { message?: string };
    throw new Error(error.message ?? 'Download failed');
  }
  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') ?? '';
  const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const simple = disposition.match(/filename="?([^";]+)"?/i)?.[1];
  const name = encoded ? decodeURIComponent(encoded) : simple ?? fallbackName;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.click();
  URL.revokeObjectURL(url);
}

export function formatDate(value?: string, withTime = false) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return withTime ? date.toLocaleString('bn-BD') : date.toLocaleDateString('bn-BD');
}

export function formatBytes(value: number | string = 0) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index > 1 ? 2 : 0)} ${units[index]}`;
}
