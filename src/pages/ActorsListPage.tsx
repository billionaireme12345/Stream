import { useState } from 'react';
import { Search, Star, Eye, Film } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { formatViews } from '@/utils/helpers';

interface ActorsListPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function ActorsListPage({ onNavigate }: ActorsListPageProps) {
  const { actors } = useData();
  const [search, setSearch] = useState('');

  const filtered = search
    ? actors.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.nationality.toLowerCase().includes(search.toLowerCase()))
    : actors;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Actors</h1>
          <p className="text-text-muted text-sm mt-1">{actors.length} actors in the collection</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search actors..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface-light border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(actor => (
          <button
            key={actor.id}
            onClick={() => onNavigate('actor', { slug: actor.slug })}
            className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-border/50 hover:border-primary/30 transition-all text-left group card-hover"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden ring-2 ring-border group-hover:ring-primary transition-all shrink-0">
              <img src={actor.photo} alt={actor.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">{actor.name}</h3>
              <p className="text-xs text-text-muted mt-0.5">{actor.nationality}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                <span className="flex items-center gap-1"><Film size={11} /> {actor.stats.totalVideos}</span>
                <span className="flex items-center gap-1"><Eye size={11} /> {formatViews(actor.stats.totalViews)}</span>
                <span className="flex items-center gap-1"><Star size={11} className="text-gold" /> {actor.stats.avgRating}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">👤</p>
          <p className="text-xl font-semibold text-text-primary">No actors found</p>
        </div>
      )}
    </div>
  );
}
