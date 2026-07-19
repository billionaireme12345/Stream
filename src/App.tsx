import { useState, useEffect, useCallback } from 'react';
import { getSession } from '@/store/useStore';
import { usePrefs } from '@/store/useStore';
import { ToastContainer } from '@/components/Toast';
import LoginPage from '@/pages/LoginPage';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import HomePage from '@/pages/HomePage';
import BrowsePage from '@/pages/BrowsePage';
import VideoPage from '@/pages/VideoPage';
import ActorPage from '@/pages/ActorPage';
import ActorsListPage from '@/pages/ActorsListPage';
import CategoriesPage from '@/pages/CategoriesPage';
import FavoritesPage from '@/pages/FavoritesPage';
import WatchLaterPage from '@/pages/WatchLaterPage';
import HistoryPage from '@/pages/HistoryPage';
import PlaylistPage from '@/pages/PlaylistPage';

interface RouteState {
  page: string;
  params: Record<string, string>;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [route, setRoute] = useState<RouteState>({ page: 'home', params: {} });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { prefs } = usePrefs();

  // Check session on load
  useEffect(() => {
    const session = getSession();
    if (session) {
      setIsAuthenticated(true);
    }
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.className = prefs.theme;
    if (prefs.theme === 'dark') {
      document.body.style.backgroundColor = '#0f0f14';
      document.body.style.color = '#f1f1f4';
    } else {
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#1e293b';
    }
  }, [prefs.theme]);

  const navigate = useCallback((page: string, params?: Record<string, string>) => {
    setRoute({ page, params: params || {} });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSidebarOpen(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === 'h' && !e.ctrlKey && !e.metaKey) navigate('home');
      if (e.key === 'b' && !e.ctrlKey && !e.metaKey) navigate('browse');
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey) navigate('favorites');
    };
    if (isAuthenticated) {
      document.addEventListener('keydown', handler);
    }
    return () => document.removeEventListener('keydown', handler);
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onLogin={() => setIsAuthenticated(true)} />
        <ToastContainer />
      </>
    );
  }

  const renderPage = () => {
    switch (route.page) {
      case 'home': return <HomePage onNavigate={navigate} />;
      case 'browse': return <BrowsePage onNavigate={navigate} params={route.params} />;
      case 'video': return <VideoPage onNavigate={navigate} params={route.params} />;
      case 'actor': return <ActorPage onNavigate={navigate} params={route.params} />;
      case 'actors': return <ActorsListPage onNavigate={navigate} />;
      case 'categories': return <CategoriesPage onNavigate={navigate} />;
      case 'favorites': return <FavoritesPage onNavigate={navigate} />;
      case 'watch-later': return <WatchLaterPage onNavigate={navigate} />;
      case 'history': return <HistoryPage onNavigate={navigate} />;
      case 'playlist': return <PlaylistPage onNavigate={navigate} params={route.params} />;
      default: return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className={`min-h-screen ${prefs.theme === 'light' ? 'bg-[#f8fafc] text-[#1e293b]' : 'bg-surface-dark text-text-primary'}`}>
      <Header
        onNavigate={navigate}
        currentPage={route.page}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <Sidebar
        isOpen={sidebarOpen}
        currentPage={route.page}
        onNavigate={navigate}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <main className="pt-16 lg:pl-60">
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
          {renderPage()}
        </div>
      </main>

      <ToastContainer />
    </div>
  );
}
