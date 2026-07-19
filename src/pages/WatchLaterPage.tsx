import { useMemo } from 'react';
import { BookmarkPlus } from 'lucide-react';
import VideoCard from '@/components/VideoCard';
import { useData } from '@/hooks/useData';
import { usePrefs } from '@/store/useStore';

interface WatchLaterPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function WatchLaterPage({ onNavigate }: WatchLaterPageProps) {
  const { getVideo } = useData();
  const { prefs } = usePrefs();

  const watchLater = useMemo(() => {
    return prefs.watchLater.map(id => getVideo(id)).filter(Boolean) as ReturnType<typeof getVideo>[];
  }, [prefs.watchLater]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-2">
          <BookmarkPlus size={28} className="text-primary" /> Watch Later
        </h1>
        <p className="text-text-muted text-sm mt-1">{watchLater.length} {watchLater.length === 1 ? 'video' : 'videos'} saved</p>
      </div>

      {watchLater.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {watchLater.map(video => video && (
            <VideoCard key={video.id} video={video} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🕐</p>
          <p className="text-xl font-semibold text-text-primary mb-2">Watch Later list is empty</p>
          <p className="text-text-muted mb-4">Save videos to watch them later</p>
          <button onClick={() => onNavigate('browse')} className="px-6 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-light transition-colors">
            Browse Videos
          </button>
        </div>
      )}
    </div>
  );
}
