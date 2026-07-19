import { useState, useRef, useCallback } from 'react';
import { Play, Heart, BookmarkPlus, Star, Eye } from 'lucide-react';
import { usePrefs } from '@/store/useStore';
import { useData } from '@/hooks/useData';
import { formatDuration, formatViews, timeAgo } from '@/utils/helpers';
import { showToast } from '@/components/Toast';
import type { Video } from '@/types';

interface VideoCardProps {
  video: Video;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export default function VideoCard({ video, onNavigate, size = 'md', showProgress = false }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { toggleFavorite, toggleWatchLater, isFavorite, isWatchLater, getProgress } = usePrefs();
  const { getVideoActors, getVideoCategories } = useData();
  const hoverTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const longPressTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const actors = getVideoActors(video);
  const categories = getVideoCategories(video);
  const progress = getProgress(video.id);
  const fav = isFavorite(video.id);
  const wl = isWatchLater(video.id);

  const handleMouseEnter = useCallback(() => {
    hoverTimeout.current = setTimeout(() => setIsHovered(true), 300);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setIsHovered(false);
  }, []);

  const handleTouchStart = useCallback(() => {
    longPressTimeout.current = setTimeout(() => setIsHovered(true), 500);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
  }, []);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(video.id);
    showToast(fav ? 'Removed from favorites' : 'Added to favorites', 'success');
  };

  const handleWatchLater = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchLater(video.id);
    showToast(wl ? 'Removed from Watch Later' : 'Added to Watch Later', 'success');
  };

  return (
    <div
      className="group relative card-hover cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={() => onNavigate('video', { slug: video.slug })}
    >
      {/* Thumbnail */}
      <div className={`relative rounded-xl overflow-hidden ${size === 'lg' ? 'aspect-[16/9]' : 'aspect-video'} bg-surface-light`}>
        {!imageLoaded && <div className="absolute inset-0 skeleton" />}
        <img
          src={video.thumbnail}
          alt={video.title}
          className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? 'scale-110 brightness-75' : ''} ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 video-card-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 rounded-md text-xs font-medium text-white">
          {formatDuration(video.duration)}
        </div>

        {/* Resolution badge */}
        {(video.resolution === '4K' || video.resolution === 'Full HD') && (
          <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${video.resolution === '4K' ? 'bg-gold text-black' : 'bg-primary text-white'}`}>
            {video.resolution}
          </div>
        )}

        {/* Hover actions */}
        <div className={`absolute inset-0 flex items-center justify-center gap-3 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary hover:scale-110 transition-all shadow-lg shadow-primary/30">
            <Play size={20} className="text-white ml-0.5" fill="white" />
          </button>
        </div>

        {/* Quick action buttons on hover */}
        <div className={`absolute top-2 right-2 flex flex-col gap-1.5 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
          <button
            onClick={handleFavorite}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${fav ? 'bg-accent text-white' : 'bg-black/60 text-white hover:bg-accent'}`}
            title={fav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={14} fill={fav ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleWatchLater}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${wl ? 'bg-primary text-white' : 'bg-black/60 text-white hover:bg-primary'}`}
            title={wl ? 'Remove from Watch Later' : 'Add to Watch Later'}
          >
            <BookmarkPlus size={14} />
          </button>
        </div>

        {/* Progress bar */}
        {showProgress && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0">
            <div className="progress-bar" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 px-0.5">
        <h3 className={`font-semibold text-text-primary line-clamp-1 group-hover:text-primary transition-colors ${size === 'lg' ? 'text-base' : 'text-sm'}`}>
          {video.title}
        </h3>
        {actors.length > 0 && (
          <p className="text-xs text-text-muted mt-1 line-clamp-1">
            {actors.map(a => a.name).join(', ')}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1.5 text-xs text-text-muted">
          <span className="flex items-center gap-1"><Eye size={12} /> {formatViews(video.views)}</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Star size={12} className="text-gold" /> {video.rating}</span>
          <span>•</span>
          <span>{timeAgo(video.releaseDate)}</span>
        </div>
        {size === 'lg' && categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {categories.slice(0, 3).map(cat => (
              <span key={cat.id} className="text-[10px] px-2 py-0.5 rounded-full bg-surface-light text-text-muted">
                {cat.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function VideoCardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-fade-in">
          <div className="aspect-video rounded-xl skeleton" />
          <div className="mt-3 space-y-2">
            <div className="h-4 w-3/4 rounded skeleton" />
            <div className="h-3 w-1/2 rounded skeleton" />
            <div className="h-3 w-2/3 rounded skeleton" />
          </div>
        </div>
      ))}
    </>
  );
}
