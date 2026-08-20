import { Outlet, Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: 'Search', icon: '🔍' },
  { path: '/sets', label: 'Sets', icon: '📦' },
  { path: '/deck-builder', label: 'Deck Builder', icon: '⚔️' },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="logo">
          <span className="logo-icon">🃏</span>
          <span className="logo-text">MTG Explorer</span>
        </Link>
        <nav className="nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
