import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCardSearch, useSets, useCatalog } from '../hooks/useCards';
import type { MtgColor } from '../lib/types';
import ManaFilter from '../components/ManaFilter';
import CardGrid from '../components/CardGrid';

const RARITIES = ['common', 'uncommon', 'rare', 'mythic'] as const;
const CARD_TYPES = ['creature', 'instant', 'sorcery', 'enchantment', 'artifact', 'planeswalker', 'land'] as const;
const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'cmc', label: 'Mana Value' },
  { value: 'color', label: 'Color' },
  { value: 'rarity', label: 'Rarity' },
  { value: 'price', label: 'Price' },
  { value: 'edhrec_rank', label: 'Popularity' },
];

export default function SetDetailPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [rarity, setRarity] = useState('');
  const [colors, setColors] = useState<MtgColor[]>([]);
  const [cardType, setCardType] = useState('');
  const [keyword, setKeyword] = useState('');
  const [order, setOrder] = useState('name');
  const [dir, setDir] = useState<'asc' | 'desc'>('asc');

  const { data: keywordsData } = useCatalog('keyword-abilities');
  const keywords: string[] = keywordsData?.data || [];

  const query = [
    `set:${code}`,
    rarity && `r:${rarity}`,
    colors.length > 0 && `c:${colors.join('')}`,
    cardType && `t:${cardType}`,
    keyword && `kw:"${keyword}"`,
  ]
    .filter(Boolean)
    .join(' ');

  const { data, isLoading, error } = useCardSearch(query, page, order, dir);
  const { data: setsData } = useSets();
  const set = setsData?.data?.find((s: any) => s.code === code);

  const updateFilters = (fn: () => void) => {
    fn();
    setPage(1);
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <Link to="/sets" className="btn btn-back">
          ← All Sets
        </Link>
        <h1>{set?.name || code?.toUpperCase()}</h1>
        {set && (
          <p className="search-subtitle">
            {set.code.toUpperCase()} · {set.cardCount} cards
            {set.releasedAt && ` · ${set.releasedAt}`}
          </p>
        )}
      </div>

      <div className="set-filters">
        <div className="set-filter-group">
          <label>Color</label>
          <ManaFilter selected={colors} onChange={(c) => updateFilters(() => setColors(c))} />
        </div>

        <div className="set-filter-group">
          <label>Rarity</label>
          <select
            className="select-input"
            value={rarity}
            onChange={(e) => updateFilters(() => setRarity(e.target.value))}
          >
            <option value="">Any</option>
            {RARITIES.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="set-filter-group">
          <label>Type</label>
          <select
            className="select-input"
            value={cardType}
            onChange={(e) => updateFilters(() => setCardType(e.target.value))}
          >
            <option value="">Any</option>
            {CARD_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="set-filter-group">
          <label>Keyword</label>
          <select
            className="select-input"
            value={keyword}
            onChange={(e) => updateFilters(() => setKeyword(e.target.value))}
          >
            <option value="">Any</option>
            {[...keywords].sort().map((kw) => (
              <option key={kw} value={kw}>
                {kw}
              </option>
            ))}
          </select>
        </div>

        <div className="set-filter-group">
          <label>Sort by</label>
          <select className="select-input" value={order} onChange={(e) => setOrder(e.target.value)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="set-filter-group">
          <label>Direction</label>
          <select
            className="select-input"
            value={dir}
            onChange={(e) => setDir(e.target.value as 'asc' | 'desc')}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          Error: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      )}

      {isLoading && (
        <div className="loading">
          <div className="skeleton-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        </div>
      )}

      {data && (
        <>
          <div className="search-results-info">
            Found {data.totalCards.toLocaleString()} cards
          </div>
          <CardGrid cards={data.data} onCardClick={(id) => navigate(`/card/${id}`)} />
          {(data.hasMore || page > 1) && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="page-info">Page {page}</span>
              <button
                className="btn btn-primary"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.hasMore}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
