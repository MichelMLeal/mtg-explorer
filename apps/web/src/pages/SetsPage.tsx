import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSets } from '../hooks/useCards';

export default function SetsPage() {
  const { data, isLoading } = useSets();
  const [filter, setFilter] = useState('');

  const sets = data?.data || [];
  const filtered = filter
    ? sets.filter((s: any) => s.name.toLowerCase().includes(filter.toLowerCase()))
    : sets;

  return (
    <div className="sets-page">
      <h1>Magic Sets</h1>
      <div className="sets-filter">
        <input
          type="text"
          placeholder="Filter sets..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="search-input"
        />
      </div>

      {isLoading ? (
        <div className="loading">Loading sets...</div>
      ) : (
        <div className="sets-grid">
          {filtered.map((set: any) => (
            <Link key={set.code} to={`/sets/${set.code}`} className="set-card">
              <div className="set-icon">
                <img src={set.iconSvgUri} alt={set.name} width={48} height={48} />
              </div>
              <div className="set-info">
                <div className="set-name">{set.name}</div>
                <div className="set-meta">
                  {set.code.toUpperCase()} · {set.cardCount} cards
                  {set.releasedAt && ` · ${set.releasedAt}`}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
