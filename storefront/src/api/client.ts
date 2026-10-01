const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('genrage_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('genrage_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('genrage_token');
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
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
    throw new Error(data.error || 'An error occurred during network request');
  }

  return data as T;
}
