import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCardSearch, useRandomCard } from '../hooks/useCards';
import SearchBar from '../components/SearchBar';
import CardGrid from '../components/CardGrid';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useCardSearch(searchQuery, page);
  const randomCard = useRandomCard();

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setPage(1);
  }, []);

  const handleRandom = () => {
    if (randomCard.data) {
      navigate(`/card/${randomCard.data.id}`);
    }
  };

  // Extract query from URL on mount
  const params = new URLSearchParams(window.location.search);
  const urlQuery = params.get('q');
  if (urlQuery && urlQuery !== searchQuery) {
    handleSearch(urlQuery);
  }

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Search Magic Cards</h1>
        <p className="search-subtitle">
          Search {`>`}30,000 cards with Scryfall syntax
        </p>
      </div>

      <SearchBar />

      <div className="search-actions">
        <button className="btn btn-secondary" onClick={handleRandom} disabled={randomCard.isLoading}>
          🎲 Random Card
        </button>
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
          <CardGrid
            cards={data.data}
            onCardClick={(id) => navigate(`/card/${id}`)}
          />
          {data.hasMore && (
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
