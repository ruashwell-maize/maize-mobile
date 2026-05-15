import { supabase } from '@/lib/supabase';

export const API_BASE_URL = 'https://www.bemaize.com';

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  return headers;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = await getAuthHeaders();
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers ?? {}) },
  });
}
