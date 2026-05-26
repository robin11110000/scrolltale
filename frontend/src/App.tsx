import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CoinProvider } from './context/CoinContext';
import BottomNav from './components/BottomNav';
import DiscoverPage from './pages/DiscoverPage';
import SeriesPage from './pages/SeriesPage';
import ReaderPage from './pages/ReaderPage';
import CreatorPage from './pages/CreatorPage';
import ProfilePage from './pages/ProfilePage';
import './styles.css';

function AppShell() {
  const location = useLocation();
  const isReader = location.pathname.startsWith('/read/');
  return (
    <div className="phone-frame">
      <div className="phone-screen">
        <Routes>
          <Route path="/" element={<DiscoverPage />} />
          <Route path="/series/:id" element={<SeriesPage />} />
          <Route path="/read/:seriesId/:episodeId" element={<ReaderPage />} />
          <Route path="/creator" element={<CreatorPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<DiscoverPage />} />
        </Routes>
        {!isReader && <BottomNav />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <CoinProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </CoinProvider>
  );
}
