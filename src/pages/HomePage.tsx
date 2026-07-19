import { useMemo } from 'react';
import HeroBanner from '@/components/HeroBanner';
import VideoRow from '@/components/VideoRow';

import { useData } from '@/hooks/useData';
import { usePrefs } from '@/store/useStore';
import { shuffleArray } from '@/utils/helpers';

interface HomePageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { getFeaturedVideos, getTrendingVideos, getLatestVideos, getPopularVideos, getTopRatedVideos, videos, categories, getVideo, playlists, getPlaylistVideos, actors } = useData();
  const { prefs } = usePrefs();

  const featured = getFeaturedVideos();
  const trending = getTrendingVideos();
  const latest = getLatestVideos();
  const popular = getPopularVideos();
  const topRated = getTopRatedVideos();

  const continueWatching = useMemo(() => {
    return prefs.watchHistory
      .filter(h => h.progress > 0 && h.progress < 95)
      .slice(0, 10)
      .map(h => getVideo(h.videoId))
      .filter(Boolean) as typeof videos;
  }, [prefs.watchHistory]);

  const recentlyWatched = useMemo(() => {
    return prefs.watchHistory
      .slice(0, 10)
      .map(h => getVideo(h.videoId))
      .filter(Boolean) as typeof videos;
  }, [prefs.watchHistory]);

  const favorites = useMemo(() => {
    return prefs.favorites
      .map(id => getVideo(id))
      .filter(Boolean) as typeof videos;
  }, [prefs.favorites]);

  const watchLater = useMemo(() => {
    return prefs.watchLater
      .map(id => getVideo(id))
      .filter(Boolean) as typeof videos;
  }, [prefs.watchLater]);

  const recommended = useMemo(() => shuffleArray(videos).slice(0, 10), []);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-4">
        <HeroBanner videos={featured.length > 0 ? featured : videos.slice(0, 5)} onNavigate={onNavigate} />
      </div>

      <div className="mt-8 space-y-2">
        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <VideoRow
            title="Continue Watching"
            subtitle="Pick up where you left off"
            videos={continueWatching}
            onNavigate={onNavigate}
            showProgress
          />
        )}

        {/* Trending */}
        <VideoRow
          title="🔥 Trending Now"
          subtitle="What everyone's watching"
          videos={trending}
          onNavigate={onNavigate}
          onSeeAll={() => onNavigate('browse', { sort: 'popular' })}
        />

        {/* Latest */}
        <VideoRow
          title="Latest Uploads"
          subtitle="Fresh content just added"
          videos={latest}
          onNavigate={onNavigate}
          onSeeAll={() => onNavigate('browse', { sort: 'newest' })}
        />

        {/* Recently Watched */}
        {recentlyWatched.length > 0 && (
          <VideoRow
            title="Recently Watched"
            videos={recentlyWatched}
            onNavigate={onNavigate}
            onSeeAll={() => onNavigate('history')}
          />
        )}

        {/* Popular */}
        <VideoRow
          title="Most Popular"
          subtitle="All-time fan favorites"
          videos={popular}
          onNavigate={onNavigate}
        />

        {/* Top Rated */}
        <VideoRow
          title="⭐ Top Rated"
          subtitle="Critically acclaimed content"
          videos={topRated}
          onNavigate={onNavigate}
          onSeeAll={() => onNavigate('browse', { sort: 'rating' })}
        />

        {/* Favorites */}
        {favorites.length > 0 && (
          <VideoRow
            title="❤️ Your Favorites"
            videos={favorites}
            onNavigate={onNavigate}
            onSeeAll={() => onNavigate('favorites')}
          />
        )}

        {/* Watch Later */}
        {watchLater.length > 0 && (
          <VideoRow
            title="🕐 Watch Later"
            videos={watchLater}
            onNavigate={onNavigate}
            onSeeAll={() => onNavigate('watch-later')}
          />
        )}

        {/* Playlists */}
        {playlists.map(pl => {
          const plVideos = getPlaylistVideos(pl.id);
          if (plVideos.length === 0) return null;
          return (
            <VideoRow
              key={pl.id}
              title={pl.name}
              subtitle={pl.description}
              videos={plVideos}
              onNavigate={onNavigate}
              onSeeAll={() => onNavigate('playlist', { id: pl.id })}
            />
          );
        })}

        {/* Recommended */}
        <VideoRow
          title="Recommended for You"
          subtitle="Based on your taste"
          videos={recommended}
          onNavigate={onNavigate}
        />

        {/* Categories Grid */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-4 px-1">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onNavigate('browse', { category: cat.id })}
                className="group p-4 rounded-xl bg-surface-light border border-border/50 hover:border-primary/30 transition-all hover:bg-surface-lighter text-center card-hover"
              >
                <span className="text-3xl block mb-2">{cat.icon}</span>
                <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Actors Strip */}
        <section className="mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-4 px-1">Popular Actors</h2>
          <div className="flex gap-5 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {actors.map(actor => (
              <button
                key={actor.id}
                onClick={() => onNavigate('actor', { slug: actor.slug })}
                className="flex flex-col items-center gap-2 flex-shrink-0 group"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden ring-2 ring-border group-hover:ring-primary transition-all">
                  <img src={actor.photo} alt={actor.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-xs md:text-sm font-medium text-text-secondary group-hover:text-primary transition-colors text-center w-20 md:w-24 line-clamp-1">
                  {actor.name}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
