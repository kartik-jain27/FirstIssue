import { Route, Routes } from 'react-router-dom';
import Footer from './components/Layout/Footer.jsx';
import Navbar from './components/Layout/Navbar.jsx';
import AboutPage from './pages/AboutPage.jsx';
import BookmarksPage from './pages/BookmarksPage.jsx';
import HomePage from './pages/HomePage.jsx';
import StatsPage from './pages/StatsPage.jsx';

/**
 * Root application shell with shared navigation and route outlets.
 * @returns {JSX.Element}
 */
export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 antialiased transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
