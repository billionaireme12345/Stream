import { useState, useMemo, useEffect } from 'react';
import { Filter, X, LayoutGrid } from 'lucide-react';
import VideoCard from '@/components/VideoCard';
import { useData } from '@/hooks/useData';

interface BrowsePageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  params: Record<string, string>;
}

export default function BrowsePage({ onNavigate, params }: BrowsePageProps) {
  const { filterVideos, categories, actors, networks, studios, getAllTags, getAllLanguages, getAllResolutions } = useData();

  const [query, setQuery] = useState(params.q || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(params.category ? [params.category] : []);
  const [selectedActors, setSelectedActors] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [selectedStudio, setSelectedStudio] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedResolution, setSelectedResolution] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [sortBy, setSortBy] = useState(params.sort || 'newest');
  const [showFilters, setShowFilters] = useState(false);
  const [gridCols, setGridCols] = useState(4);
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    if (params.q) setQuery(params.q);
    if (params.category) setSelectedCategories([params.category]);
    if (params.sort) setSortBy(params.sort);
  }, [params.q, params.category, params.sort]);

  const allTags = getAllTags();
  const allLanguages = getAllLanguages();
  const allResolutions = getAllResolutions();

  const filteredVideos = useMemo(() => {
    return filterVideos({
      query,
      categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
      actorIds: selectedActors.length > 0 ? selectedActors : undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      networkId: selectedNetwork || undefined,
      studioId: selectedStudio || undefined,
      type: selectedType || undefined,
      resolution: selectedResolution || undefined,
      language: selectedLanguage || undefined,
      sortBy,
    });
  }, [query, selectedCategories, selectedActors, selectedTags, selectedNetwork, selectedStudio, selectedType, selectedResolution, selectedLanguage, sortBy]);

  const visibleVideos = filteredVideos.slice(0, visibleCount);
  const hasMore = visibleCount < filteredVideos.length;

  const activeFilterCount = [
    selectedCategories.length > 0, selectedActors.length > 0, selectedTags.length > 0,
    !!selectedNetwork, !!selectedStudio, !!selectedType, !!selectedResolution, !!selectedLanguage,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCategories([]); setSelectedActors([]); setSelectedTags([]);
    setSelectedNetwork(''); setSelectedStudio(''); setSelectedType('');
    setSelectedResolution(''); setSelectedLanguage(''); setQuery('');
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const toggleActor = (id: string) => {
    setSelectedActors(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            {query ? `Results for "${query}"` : 'Browse All'}
          </h1>
          <p className="text-text-muted text-sm mt-1">{filteredVideos.length} videos found</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${showFilters || activeFilterCount > 0 ? 'bg-primary text-white' : 'bg-surface-light text-text-secondary hover:text-text-primary border border-border'}`}
          >
            <Filter size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-surface-light border border-border text-sm text-text-primary focus:outline-none focus:border-primary"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Top Rated</option>
            <option value="duration-desc">Longest</option>
            <option value="duration-asc">Shortest</option>
            <option value="title">A-Z</option>
          </select>
          <div className="hidden md:flex items-center gap-1 bg-surface-light rounded-xl border border-border p-1">
            {[3, 4, 5].map(cols => (
              <button
                key={cols}
                onClick={() => setGridCols(cols)}
                className={`p-1.5 rounded-lg transition-colors ${gridCols === cols ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'}`}
              >
                <LayoutGrid size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search videos by title, tags..."
          className="w-full px-4 py-3 rounded-xl bg-surface-light border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-5 bg-surface rounded-xl border border-border animate-slide-up space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-text-primary">Advanced Filters</h3>
            <button onClick={clearFilters} className="text-sm text-accent hover:text-accent-light transition-colors flex items-center gap-1">
              <X size={14} /> Clear all
            </button>
          </div>

          {/* Categories */}
          <div>
            <p className="text-sm font-medium text-text-secondary mb-2">Categories</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedCategories.includes(cat.id) ? 'bg-primary text-white' : 'bg-surface-light text-text-secondary hover:text-text-primary border border-border'}`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Actors */}
          <div>
            <p className="text-sm font-medium text-text-secondary mb-2">Actors</p>
            <div className="flex flex-wrap gap-2">
              {actors.map(actor => (
                <button
                  key={actor.id}
                  onClick={() => toggleActor(actor.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedActors.includes(actor.id) ? 'bg-primary text-white' : 'bg-surface-light text-text-secondary hover:text-text-primary border border-border'}`}
                >
                  <img src={actor.photo} alt="" className="w-4 h-4 rounded-full object-cover" />
                  {actor.name}
                </button>
              ))}
            </div>
          </div>

          {/* Row of selects */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Network</label>
              <select value={selectedNetwork} onChange={e => setSelectedNetwork(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-light border border-border text-sm text-text-primary focus:outline-none">
                <option value="">All</option>
                {networks.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Studio</label>
              <select value={selectedStudio} onChange={e => setSelectedStudio(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-light border border-border text-sm text-text-primary focus:outline-none">
                <option value="">All</option>
                {studios.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Type</label>
              <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-light border border-border text-sm text-text-primary focus:outline-none">
                <option value="">All</option>
                <option value="professional">Professional</option>
                <option value="homemade">Homemade</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Resolution</label>
              <select value={selectedResolution} onChange={e => setSelectedResolution(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-light border border-border text-sm text-text-primary focus:outline-none">
                <option value="">All</option>
                {allResolutions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Language</label>
              <select value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-surface-light border border-border text-sm text-text-primary focus:outline-none">
                <option value="">All</option>
                {allLanguages.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <p className="text-sm font-medium text-text-secondary mb-2">Tags</p>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${selectedTags.includes(tag) ? 'bg-primary text-white' : 'bg-surface-light text-text-muted hover:text-text-secondary border border-border/50'}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCategories.map(id => {
            const cat = categories.find(c => c.id === id);
            return cat ? (
              <span key={id} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium">
                {cat.name}
                <button onClick={() => toggleCategory(id)}><X size={12} /></button>
              </span>
            ) : null;
          })}
          {selectedActors.map(id => {
            const act = actors.find(a => a.id === id);
            return act ? (
              <span key={id} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium">
                {act.name}
                <button onClick={() => toggleActor(id)}><X size={12} /></button>
              </span>
            ) : null;
          })}
        </div>
      )}

      {/* Results Grid */}
      <div className={`grid gap-5 grid-cols-1 sm:grid-cols-2 ${gridCols === 3 ? 'lg:grid-cols-3' : gridCols === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
        {visibleVideos.map(video => (
          <VideoCard key={video.id} video={video} onNavigate={onNavigate} />
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🎬</p>
          <p className="text-xl font-semibold text-text-primary mb-2">No videos found</p>
          <p className="text-text-muted">Try adjusting your filters or search query</p>
          <button onClick={clearFilters} className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-light transition-colors">
            Clear Filters
          </button>
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center mt-10">
          <button
            onClick={() => setVisibleCount(prev => prev + 20)}
            className="px-8 py-3 rounded-xl bg-surface-light border border-border text-text-primary font-medium hover:bg-surface-lighter transition-colors"
          >
            Load More ({filteredVideos.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
