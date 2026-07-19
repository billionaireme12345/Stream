import { useState, useRef, useEffect } from 'react';
import { Search, Play, Menu, X, Sun, Moon, User, LogOut, Heart, Clock, BookmarkPlus } from 'lucide-react';
import { usePrefs, clearSession, getSession } from '@/store/useStore';
import { useData } from '@/hooks/useData';

interface HeaderProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  currentPage: string;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export default function Header({ onNavigate, onToggleSidebar, sidebarOpen }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { prefs, setTheme } = usePrefs();
  const { searchAll } = useData();
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const session = getSession();

  const suggestions = searchQuery.length >= 2 ? searchAll(searchQuery) : null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => document.getElementById('global-search')?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowSuggestions(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('browse', { q: searchQuery.trim() });
      setShowSuggestions(false);
      setShowSearch(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    window.location.reload();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] glass border-b border-border/50">
      <div className="flex items-center h-16 px-4 lg:px-6">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className="lg:hidden text-text-secondary hover:text-text-primary p-1.5">
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md group-hover:shadow-primary/30 transition-shadow">
              <Play size={16} className="text-white ml-0.5" fill="white" />
            </div>
            <span className="text-lg font-bold text-gradient hidden sm:block">StreamVault</span>
          </button>
        </div>

        {/* Center: Search */}
        <div className="flex-1 flex justify-center mx-4" ref={searchRef}>
          <div className={`relative w-full max-w-xl transition-all duration-300 ${showSearch ? 'block' : 'hidden md:block'}`}>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  id="global-search"
                  type="text"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search videos, actors, categories... (press /)"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-light/80 border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:bg-surface-light transition-all"
                />
              </div>
            </form>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions && (suggestions.videos.length > 0 || suggestions.actors.length > 0 || suggestions.categories.length > 0) && (
              <div className="absolute top-full mt-2 w-full bg-surface border border-border rounded-xl shadow-2xl overflow-hidden max-h-[70vh] overflow-y-auto">
                {suggestions.actors.length > 0 && (
                  <div className="p-2">
                    <p className="text-xs font-semibold text-text-muted px-3 py-1.5 uppercase tracking-wider">Actors</p>
                    {suggestions.actors.slice(0, 4).map(actor => (
                      <button
                        key={actor.id}
                        onClick={() => { onNavigate('actor', { slug: actor.slug }); setShowSuggestions(false); setSearchQuery(''); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-light transition-colors text-left"
                      >
                        <img src={actor.photo} alt={actor.name} className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <p className="text-sm font-medium text-text-primary">{actor.name}</p>
                          <p className="text-xs text-text-muted">{actor.nationality}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {suggestions.videos.length > 0 && (
                  <div className="p-2 border-t border-border/50">
                    <p className="text-xs font-semibold text-text-muted px-3 py-1.5 uppercase tracking-wider">Videos</p>
                    {suggestions.videos.slice(0, 5).map(video => (
                      <button
                        key={video.id}
                        onClick={() => { onNavigate('video', { slug: video.slug }); setShowSuggestions(false); setSearchQuery(''); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-light transition-colors text-left"
                      >
                        <img src={video.thumbnail} alt={video.title} className="w-14 h-9 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary line-clamp-1">{video.title}</p>
                          <p className="text-xs text-text-muted">{video.resolution} • {video.language}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {suggestions.categories.length > 0 && (
                  <div className="p-2 border-t border-border/50">
                    <p className="text-xs font-semibold text-text-muted px-3 py-1.5 uppercase tracking-wider">Categories</p>
                    {suggestions.categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => { onNavigate('browse', { category: cat.id }); setShowSuggestions(false); setSearchQuery(''); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-light transition-colors text-left"
                      >
                        <span className="text-lg">{cat.icon}</span>
                        <span className="text-sm font-medium text-text-primary">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {searchQuery.trim() && (
                  <button
                    onClick={() => { onNavigate('browse', { q: searchQuery.trim() }); setShowSuggestions(false); }}
                    className="w-full flex items-center gap-3 px-5 py-3 border-t border-border/50 hover:bg-surface-light transition-colors text-left"
                  >
                    <Search size={16} className="text-primary" />
                    <span className="text-sm text-primary font-medium">Search for "{searchQuery}"</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowSearch(!showSearch)} className="md:hidden p-2 text-text-secondary hover:text-text-primary">
            <Search size={20} />
          </button>
          <button
            onClick={() => setTheme(prefs.theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-surface-light"
            title="Toggle theme"
          >
            {prefs.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-surface-light transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium text-text-primary hidden lg:block">{session?.name || 'User'}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-border/50">
                  <p className="font-semibold text-text-primary">{session?.name}</p>
                  <p className="text-xs text-text-muted">{session?.mobile}</p>
                </div>
                <div className="p-1.5">
                  <button onClick={() => { onNavigate('favorites'); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-light text-left text-sm text-text-secondary hover:text-text-primary transition-colors">
                    <Heart size={16} /> Favorites
                  </button>
                  <button onClick={() => { onNavigate('watch-later'); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-light text-left text-sm text-text-secondary hover:text-text-primary transition-colors">
                    <BookmarkPlus size={16} /> Watch Later
                  </button>
                  <button onClick={() => { onNavigate('history'); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-light text-left text-sm text-text-secondary hover:text-text-primary transition-colors">
                    <Clock size={16} /> Watch History
                  </button>
                </div>
                <div className="p-1.5 border-t border-border/50">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-left text-sm text-red-400 transition-colors">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
