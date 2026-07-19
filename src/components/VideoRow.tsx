import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import VideoCard from './VideoCard';
import type { Video } from '@/types';

interface VideoRowProps {
  title: string;
  subtitle?: string;
  videos: Video[];
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onSeeAll?: () => void;
  showProgress?: boolean;
}

export default function VideoRow({ title, subtitle, videos, onNavigate, onSeeAll, showProgress }: VideoRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      el?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [videos]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (videos.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-end justify-between mb-4 px-1">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text-primary">{title}</h2>
          {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
        </div>
        {onSeeAll && (
          <button onClick={onSeeAll} className="text-sm font-medium text-primary hover:text-primary-light transition-colors flex items-center gap-1">
            See all <ChevronRight size={16} />
          </button>
        )}
      </div>

      <div className="relative group/row">
        {/* Scroll buttons */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-16 w-12 z-10 bg-gradient-to-r from-surface-dark/90 to-transparent flex items-center justify-start pl-1 opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full bg-surface-lighter/90 flex items-center justify-center hover:bg-primary transition-colors">
              <ChevronLeft size={20} className="text-white" />
            </div>
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-16 w-12 z-10 bg-gradient-to-l from-surface-dark/90 to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full bg-surface-lighter/90 flex items-center justify-center hover:bg-primary transition-colors">
              <ChevronRight size={20} className="text-white" />
            </div>
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-none pb-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {videos.map(video => (
            <div key={video.id} className="w-[220px] md:w-[260px] lg:w-[280px] flex-shrink-0">
              <VideoCard video={video} onNavigate={onNavigate} showProgress={showProgress} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
