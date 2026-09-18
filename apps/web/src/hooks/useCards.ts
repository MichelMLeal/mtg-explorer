import { useMutation, useQuery } from '@tanstack/react-query';
import { searchCards, getCardById, getCardPrints, getSets, getFormats, getTopDecks, buildDeck, getRandomCard } from '../services/api';

export function useCardSearch(query: string, page = 1, order?: string, dir?: string) {
  return useQuery({
    queryKey: ['cards', 'search', query, page, order, dir],
    queryFn: () => searchCards(query, page, 20, order, dir),
    enabled: query.length > 0,
  });
}

export function useCard(id: string) {
  return useQuery({
    queryKey: ['card', id],
    queryFn: () => getCardById(id),
    enabled: !!id,
  });
}

export function useCardPrints(id: string) {
  return useQuery({
    queryKey: ['card', id, 'prints'],
    queryFn: () => getCardPrints(id),
    enabled: !!id,
  });
}

export function useRandomCard() {
  return useQuery({
    queryKey: ['card', 'random'],
    queryFn: getRandomCard,
  });
}

export function useSets() {
  return useQuery({
    queryKey: ['sets'],
    queryFn: getSets,
  });
}

export function useFormats() {
  return useQuery({
    queryKey: ['formats'],
    queryFn: getFormats,
  });
}

export function useTopDecks(format: string) {
  return useQuery({
    queryKey: ['meta', 'top-decks', format],
    queryFn: () => getTopDecks(format),
    enabled: !!format,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBuildDeck() {
  return useMutation({
    mutationFn: (params: {
      colors: string[];
      format: string;
      style: string;
      budget?: number;
      strategy?: string;
      count?: number;
    }) => buildDeck(params),
  });
}
