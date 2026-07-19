import { useState, useEffect, useCallback } from 'react';
import { Play, Info, ChevronLeft, ChevronRight, Star, Clock, Heart, BookmarkPlus } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { usePrefs } from '@/store/useStore';
import { formatDuration, formatViews } from '@/utils/helpers';
import { showToast } from './Toast';
import type { Video } from '@/types';

interface HeroBannerProps {
  videos: Video[];
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function HeroBanner({ videos, onNavigate }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { getVideoActors } = useData();
  const { toggleFavorite, toggleWatchLater, isFavorite, isWatchLater } = usePrefs();

  const currentVideo = videos[currentIndex];
  if (!currentVideo) return null;

  const actors = getVideoActors(currentVideo);

  const goTo = useCallback((index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((currentIndex + 1) % videos.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [currentIndex, videos.length, goTo]);

  const prev = () => goTo((currentIndex - 1 + videos.length) % videos.length);
  const next = () => goTo((currentIndex + 1) % videos.length);

  return (
    <div className="relative h-[55vh] md:h-[65vh] lg:h-[75vh] w-full overflow-hidden">
      {/* Background Image */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <img
          src={currentVideo.thumbnail}
          alt={currentVideo.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/40 to-transparent" />
      </div>

      {/* Content */}
      <div className={`absolute inset-0 flex items-end pb-16 md:pb-20 lg:pb-24 px-6 md:px-10 lg:px-16 transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <div className="max-w-2xl">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {currentVideo.isTrending && (
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-accent text-white uppercase tracking-wide">🔥 Trending</span>
            )}
            {currentVideo.isFeatured && (
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-primary text-white uppercase tracking-wide">⭐ Featured</span>
            )}
            <span className={`px-2 py-1 text-xs font-bold rounded-md uppercase tracking-wide ${currentVideo.resolution === '4K' ? 'bg-gold text-black' : 'bg-white/20 text-white'}`}>
              {currentVideo.resolution}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 leading-tight">
            {currentVideo.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/70 mb-4">
            <span className="flex items-center gap-1"><Star size={14} className="text-gold" /> {currentVideo.rating}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock size={14} /> {formatDuration(currentVideo.duration)}</span>
            <span>•</span>
            <span>{formatViews(currentVideo.views)} views</span>
            <span>•</span>
            <span>{currentVideo.language}</span>
          </div>

          <p className="text-sm md:text-base text-white/60 line-clamp-2 md:line-clamp-3 mb-6 max-w-xl">
            {currentVideo.description}
          </p>

          {/* Actors */}
          {actors.length > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <div className="flex -space-x-2">
                {actors.slice(0, 3).map(a => (
                  <img key={a.id} src={a.photo} alt={a.name} className="w-8 h-8 rounded-full border-2 border-surface-dark object-cover" />
                ))}
              </div>
              <span className="text-sm text-white/60">{actors.map(a => a.name).join(', ')}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('video', { slug: currentVideo.slug })}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50"
            >
              <Play size={20} fill="white" /> Watch Now
            </button>
            <button
              onClick={() => onNavigate('video', { slug: currentVideo.slug })}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium backdrop-blur-sm transition-all"
            >
              <Info size={18} /> More Info
            </button>
            <button
              onClick={() => { toggleFavorite(currentVideo.id); showToast(isFavorite(currentVideo.id) ? 'Removed from favorites' : 'Added to favorites', 'success'); }}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isFavorite(currentVideo.id) ? 'bg-accent text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <Heart size={20} fill={isFavorite(currentVideo.id) ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => { toggleWatchLater(currentVideo.id); showToast(isWatchLater(currentVideo.id) ? 'Removed from Watch Later' : 'Added to Watch Later', 'success'); }}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isWatchLater(currentVideo.id) ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <BookmarkPlus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-all opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100">
        <ChevronLeft size={24} />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-all opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100">
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {videos.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-primary' : 'w-1.5 bg-white/30 hover:bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}
