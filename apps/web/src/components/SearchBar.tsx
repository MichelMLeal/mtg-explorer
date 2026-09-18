import { useEffect, useState } from 'react';
import { useAutocomplete } from '../hooks/useCards';

interface SearchBarProps {
  value: string;
  onSearch: (query: string) => void;
}

export default function SearchBar({ value, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const { data } = useAutocomplete(query);
  const suggestions = showSuggestions ? data?.data || [] : [];

  const submit = (q: string) => {
    setShowSuggestions(false);
    onSearch(q.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(query);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Search cards... (e.g. Lightning Bolt, t:creature c:rw)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onKeyDown={(e) => e.key === 'Escape' && setShowSuggestions(false)}
          autoFocus
          autoComplete="off"
        />
        {suggestions.length > 0 && (
          <ul className="search-suggestions">
            {suggestions.map((name) => (
              <li key={name}>
                <button type="button" onMouseDown={() => submit(name)}>
                  {name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="submit" className="search-button">
        Search
      </button>
    </form>
  );
}
