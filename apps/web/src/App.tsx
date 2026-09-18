import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import SearchPage from './pages/SearchPage';
import CardDetailPage from './pages/CardDetailPage';
import SetsPage from './pages/SetsPage';
import SetDetailPage from './pages/SetDetailPage';
import DeckBuilderPage from './pages/DeckBuilderPage';
import TopDecksPage from './pages/TopDecksPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<SearchPage />} />
        <Route path="/card/:id" element={<CardDetailPage />} />
        <Route path="/sets" element={<SetsPage />} />
        <Route path="/sets/:code" element={<SetDetailPage />} />
        <Route path="/deck-builder" element={<DeckBuilderPage />} />
        <Route path="/top-decks" element={<TopDecksPage />} />
      </Route>
    </Routes>
  );
}
