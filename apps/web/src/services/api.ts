const API_BASE = import.meta.env.VITE_API_URL || '';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error?.message || `API error: ${response.status}`);
  }

  return response.json();
}

// ── Cards ──────────────────────────────────────────────────
export interface CardSearchResult {
  data: any[];
  totalCards: number;
  hasMore: boolean;
}

export async function searchCards(query: string, page = 1, perPage = 20): Promise<CardSearchResult> {
  const params = new URLSearchParams({ q: query, page: String(page), per_page: String(perPage) });
  return apiFetch(`/api/cards?${params.toString()}`);
}

export async function getCardById(id: string) {
  return apiFetch<any>(`/api/cards/${id}`);
}

export async function getRandomCard() {
  return apiFetch<any>('/api/cards/random');
}

// ── Sets ───────────────────────────────────────────────────
export async function getSets() {
  return apiFetch<{ data: any[] }>('/api/sets');
}

export async function getSetCards(code: string, page = 1) {
  const params = new URLSearchParams({ page: String(page) });
  return apiFetch<CardSearchResult>(`/api/sets/${code}/cards?${params.toString()}`);
}

// ── Formats ────────────────────────────────────────────────
export async function getFormats() {
  return apiFetch<{ data: any[] }>('/api/formats');
}

// ── Deck Builder ───────────────────────────────────────────
export async function buildDeck(params: {
  colors: string[];
  format: string;
  style: string;
  budget?: number;
  strategy?: string;
}) {
  return apiFetch<{ data: any }>('/api/deck/build', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
