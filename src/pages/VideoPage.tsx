import { useEffect } from 'react';
import { Heart, BookmarkPlus, Share2, ExternalLink, Star, Eye, Clock, Calendar, Film, Tag, Users, Monitor, ChevronRight } from 'lucide-react';
import VideoCard from '@/components/VideoCard';
import { useData } from '@/hooks/useData';
import { usePrefs } from '@/store/useStore';
import { formatDuration, formatViews, formatDate } from '@/utils/helpers';
import { showToast } from '@/components/Toast';

interface VideoPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  params: Record<string, string>;
}

export default function VideoPage({ onNavigate, params }: VideoPageProps) {
  const { getVideoBySlug, getVideoActors, getVideoCategories, getVideoNetwork, getVideoStudio, getRelatedVideos } = useData();
  const { toggleFavorite, toggleWatchLater, isFavorite, isWatchLater, addToHistory, updateProgress } = usePrefs();

  const video = getVideoBySlug(params.slug);

  useEffect(() => {
    if (video) {
      addToHistory(video.id, 0);
      window.scrollTo(0, 0);
    }
  }, [video?.id]);

  if (!video) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">🎬</p>
        <p className="text-xl font-semibold text-text-primary mb-2">Video not found</p>
        <button onClick={() => onNavigate('home')} className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-white font-medium">
          Go Home
        </button>
      </div>
    );
  }

  const actors = getVideoActors(video);
  const categories = getVideoCategories(video);
  const network = getVideoNetwork(video);
  const studio = getVideoStudio(video);
  const related = getRelatedVideos(video, 8);
  const fav = isFavorite(video.id);
  const wl = isWatchLater(video.id);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: video.title, url });
    } else {
      navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  const simulateProgress = () => {
    updateProgress(video.id, Math.min(95, Math.random() * 80 + 10));
  };

  return (
    <div className="animate-fade-in">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-4">
        <button onClick={() => onNavigate('home')} className="hover:text-primary transition-colors">Home</button>
        <ChevronRight size={14} />
        <button onClick={() => onNavigate('browse')} className="hover:text-primary transition-colors">Browse</button>
        <ChevronRight size={14} />
        <span className="text-text-secondary line-clamp-1">{video.title}</span>
      </nav>

      {/* Player */}
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden mb-6 shadow-2xl">
        <iframe
          src={video.embedUrl}
          title={video.title}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          onLoad={simulateProgress}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and actions */}
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {video.resolution === '4K' && <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gold text-black uppercase">4K</span>}
              {video.resolution === 'Full HD' && <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-primary text-white uppercase">Full HD</span>}
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-surface-lighter text-text-secondary uppercase">{video.type}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{video.title}</h1>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-text-muted">
              <span className="flex items-center gap-1.5"><Eye size={15} /> {formatViews(video.views)} views</span>
              <span className="flex items-center gap-1.5"><Star size={15} className="text-gold" /> {video.rating}/5</span>
              <span className="flex items-center gap-1.5"><Clock size={15} /> {formatDuration(video.duration)}</span>
              <span className="flex items-center gap-1.5"><Calendar size={15} /> {formatDate(video.releaseDate)}</span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mt-5">
              <button
                onClick={() => { toggleFavorite(video.id); showToast(fav ? 'Removed from favorites' : 'Added to favorites', 'success'); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${fav ? 'bg-accent text-white' : 'bg-surface-light border border-border text-text-secondary hover:text-accent hover:border-accent/30'}`}
              >
                <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
                {fav ? 'Favorited' : 'Favorite'}
              </button>
              <button
                onClick={() => { toggleWatchLater(video.id); showToast(wl ? 'Removed from Watch Later' : 'Added to Watch Later', 'success'); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${wl ? 'bg-primary text-white' : 'bg-surface-light border border-border text-text-secondary hover:text-primary hover:border-primary/30'}`}
              >
                <BookmarkPlus size={16} />
                {wl ? 'In Watch Later' : 'Watch Later'}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-surface-light border border-border text-text-secondary hover:text-text-primary transition-all"
              >
                <Share2 size={16} /> Share
              </button>
              {video.externalPlayerUrl && (
                <a
                  href={video.externalPlayerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-surface-light border border-border text-text-secondary hover:text-text-primary transition-all"
                >
                  <ExternalLink size={16} /> External Player
                </a>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="p-5 bg-surface rounded-xl border border-border/50">
            <h3 className="font-semibold text-text-primary mb-2">Description</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{video.description}</p>
          </div>

          {/* Actors */}
          {actors.length > 0 && (
            <div>
              <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2"><Users size={18} /> Cast</h3>
              <div className="flex flex-wrap gap-3">
                {actors.map(actor => (
                  <button
                    key={actor.id}
                    onClick={() => onNavigate('actor', { slug: actor.slug })}
                    className="flex items-center gap-3 px-4 py-3 bg-surface rounded-xl border border-border/50 hover:border-primary/30 transition-all group"
                  >
                    <img src={actor.photo} alt={actor.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-border group-hover:ring-primary transition-all" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">{actor.name}</p>
                      <p className="text-xs text-text-muted">{actor.nationality}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2"><Tag size={18} /> Tags</h3>
            <div className="flex flex-wrap gap-2">
              {video.tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => onNavigate('browse', { q: tag })}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-light border border-border/50 text-text-muted hover:text-primary hover:border-primary/30 transition-all"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info Card */}
          <div className="p-5 bg-surface rounded-xl border border-border/50 space-y-3">
            <h3 className="font-semibold text-text-primary mb-2">Details</h3>
            {categories.length > 0 && (
              <div className="flex items-start gap-2">
                <Film size={15} className="text-text-muted mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-text-muted">Categories</p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => onNavigate('browse', { category: cat.id })}
                        className="text-xs text-primary hover:text-primary-light"
                      >
                        {cat.name}{categories.indexOf(cat) < categories.length - 1 ? ',' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {network && (
              <div className="flex items-start gap-2">
                <Monitor size={15} className="text-text-muted mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-text-muted">Network</p>
                  <p className="text-sm text-text-primary">{network.name}</p>
                </div>
              </div>
            )}
            {studio && (
              <div className="flex items-start gap-2">
                <Film size={15} className="text-text-muted mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-text-muted">Studio</p>
                  <p className="text-sm text-text-primary">{studio.name}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <Calendar size={15} className="text-text-muted mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-text-muted">Release Date</p>
                <p className="text-sm text-text-primary">{formatDate(video.releaseDate)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Tag size={15} className="text-text-muted mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-text-muted">Language</p>
                <p className="text-sm text-text-primary">{video.language}</p>
              </div>
            </div>
          </div>

          {/* Related Videos */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Related Videos</h3>
            <div className="space-y-4">
              {related.map(rv => (
                <VideoCard key={rv.id} video={rv} onNavigate={onNavigate} size="sm" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
