import { Home, Compass, Users, Grid3X3, Heart, BookmarkPlus, History, ListVideo, X } from 'lucide-react';
import { useData } from '@/hooks/useData';

interface SidebarProps {
  isOpen: boolean;
  currentPage: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onClose: () => void;
}

export default function Sidebar({ isOpen, currentPage, onNavigate, onClose }: SidebarProps) {
  const { categories, playlists } = useData();

  const nav = (page: string, params?: Record<string, string>) => {
    onNavigate(page, params);
    onClose();
  };

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'browse', label: 'Browse', icon: Compass },
    { id: 'actors', label: 'Actors', icon: Users },
    { id: 'categories', label: 'Categories', icon: Grid3X3 },
  ];

  const libraryItems = [
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'watch-later', label: 'Watch Later', icon: BookmarkPlus },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[90] lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-16 left-0 bottom-0 w-64 bg-surface/95 backdrop-blur-xl border-r border-border/50 z-[95] transition-transform duration-300 overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:w-60`}>
        <div className="p-4 flex flex-col h-full">
          {/* Close button mobile */}
          <button onClick={onClose} className="lg:hidden absolute top-3 right-3 p-1 text-text-muted hover:text-text-primary">
            <X size={20} />
          </button>

          {/* Main Nav */}
          <nav className="space-y-1">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => nav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentPage === item.id
                    ? 'bg-primary/15 text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Library */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-3 mb-2">Library</p>
            <nav className="space-y-1">
              {libraryItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => nav(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    currentPage === item.id
                      ? 'bg-primary/15 text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Playlists */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-3 mb-2">Playlists</p>
            <nav className="space-y-1">
              {playlists.map(pl => (
                <button
                  key={pl.id}
                  onClick={() => nav('playlist', { id: pl.id })}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light transition-all text-left"
                >
                  <ListVideo size={16} />
                  <span className="line-clamp-1">{pl.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Categories */}
          <div className="mt-6 mb-6">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-3 mb-2">Categories</p>
            <nav className="space-y-0.5">
              {categories.slice(0, 8).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => nav('browse', { category: cat.id })}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light transition-all text-left"
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="line-clamp-1">{cat.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}
