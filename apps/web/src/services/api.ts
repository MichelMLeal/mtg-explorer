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

export async function searchCards(
  query: string,
  page = 1,
  perPage = 20,
  order?: string,
  dir?: string,
): Promise<CardSearchResult> {
  const params = new URLSearchParams({ q: query, page: String(page), perPage: String(perPage) });
  if (order) params.set('order', order);
  if (dir) params.set('dir', dir);
  return apiFetch(`/api/cards?${params.toString()}`);
}

export async function getCardById(id: string) {
  return apiFetch<any>(`/api/cards/${id}`);
}

export async function getCardPrints(id: string) {
  return apiFetch<{ data: any[] }>(`/api/cards/${id}/prints`);
}

export async function getRandomCard() {
  return apiFetch<any>('/api/cards/random');
}

// ── Sets ───────────────────────────────────────────────────
export async function getSets() {
  return apiFetch<{ data: any[] }>('/api/sets');
}

// ── Formats ────────────────────────────────────────────────
export async function getFormats() {
  return apiFetch<{ data: any[] }>('/api/formats');
}

// ── Top Decks ──────────────────────────────────────────────
export async function getTopDecks(format: string) {
  return apiFetch<{ data: any[] }>(`/api/meta/top-decks?format=${format}`);
}

// ── Deck Builder ───────────────────────────────────────────
export async function buildDeck(params: {
  colors: string[];
  format: string;
  style: string;
  budget?: number;
  strategy?: string;
  count?: number;
}) {
  return apiFetch<{ data: any[] }>('/api/deck/build', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
