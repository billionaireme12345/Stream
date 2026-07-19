import { useMemo } from 'react';
import { Heart } from 'lucide-react';
import VideoCard from '@/components/VideoCard';
import { useData } from '@/hooks/useData';
import { usePrefs } from '@/store/useStore';

interface FavoritesPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function FavoritesPage({ onNavigate }: FavoritesPageProps) {
  const { getVideo } = useData();
  const { prefs } = usePrefs();

  const favorites = useMemo(() => {
    return prefs.favorites.map(id => getVideo(id)).filter(Boolean) as ReturnType<typeof getVideo>[];
  }, [prefs.favorites]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-2">
          <Heart size={28} className="text-accent" /> Favorites
        </h1>
        <p className="text-text-muted text-sm mt-1">{favorites.length} {favorites.length === 1 ? 'video' : 'videos'} in your favorites</p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {favorites.map(video => video && (
            <VideoCard key={video.id} video={video} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">❤️</p>
          <p className="text-xl font-semibold text-text-primary mb-2">No favorites yet</p>
          <p className="text-text-muted mb-4">Start adding videos you love to your favorites</p>
          <button onClick={() => onNavigate('browse')} className="px-6 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-light transition-colors">
            Browse Videos
          </button>
        </div>
      )}
    </div>
  );
}
