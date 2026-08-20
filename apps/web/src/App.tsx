import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import SearchPage from './pages/SearchPage';
import CardDetailPage from './pages/CardDetailPage';
import SetsPage from './pages/SetsPage';
import DeckBuilderPage from './pages/DeckBuilderPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<SearchPage />} />
        <Route path="/card/:id" element={<CardDetailPage />} />
        <Route path="/sets" element={<SetsPage />} />
        <Route path="/deck-builder" element={<DeckBuilderPage />} />
      </Route>
    </Routes>
  );
}
