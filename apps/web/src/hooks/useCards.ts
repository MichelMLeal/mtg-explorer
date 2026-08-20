import { useQuery } from '@tanstack/react-query';
import { searchCards, getCardById, getSets, getSetCards, getFormats, buildDeck, getRandomCard } from '../services/api';

export function useCardSearch(query: string, page = 1) {
  return useQuery({
    queryKey: ['cards', 'search', query, page],
    queryFn: () => searchCards(query, page),
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

export function useSetCards(code: string, page = 1) {
  return useQuery({
    queryKey: ['sets', code, page],
    queryFn: () => getSetCards(code, page),
    enabled: !!code,
  });
}

export function useFormats() {
  return useQuery({
    queryKey: ['formats'],
    queryFn: getFormats,
  });
}

export function useBuildDeck(params: {
  colors: string[];
  format: string;
  style: string;
  budget?: number;
  strategy?: string;
}) {
  return useQuery({
    queryKey: ['deck', 'build', params],
    queryFn: () => buildDeck(params),
    enabled: params.colors.length > 0 && !!params.format,
  });
}
