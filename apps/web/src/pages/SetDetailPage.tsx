import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSetCards, useSets } from '../hooks/useCards';
import CardGrid from '../components/CardGrid';

export default function SetDetailPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useSetCards(code || '', page);
  const { data: setsData } = useSets();
  const set = setsData?.data?.find((s: any) => s.code === code);

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
