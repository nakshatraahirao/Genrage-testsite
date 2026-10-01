const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function getAdminToken(): string | null {
  return localStorage.getItem('genrage_admin_token');
}

export function setAdminToken(token: string): void {
  localStorage.setItem('genrage_admin_token', token);
}

export function removeAdminToken(): void {
  localStorage.removeItem('genrage_admin_token');
}

export async function adminFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data as T;
}
