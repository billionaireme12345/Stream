import { useMemo } from 'react';
import { History, Trash2 } from 'lucide-react';
import VideoCard from '@/components/VideoCard';
import { useData } from '@/hooks/useData';
import { usePrefs } from '@/store/useStore';
import { showToast } from '@/components/Toast';

interface HistoryPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function HistoryPage({ onNavigate }: HistoryPageProps) {
  const { getVideo } = useData();
  const { prefs, clearHistory } = usePrefs();

  const history = useMemo(() => {
    return prefs.watchHistory.map(h => getVideo(h.videoId)).filter(Boolean) as ReturnType<typeof getVideo>[];
  }, [prefs.watchHistory]);

  const handleClear = () => {
    clearHistory();
    showToast('Watch history cleared', 'success');
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-2">
            <History size={28} className="text-primary" /> Watch History
          </h1>
          <p className="text-text-muted text-sm mt-1">{history.length} {history.length === 1 ? 'video' : 'videos'} watched</p>
        </div>
        {history.length > 0 && (
          <button onClick={handleClear} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors">
            <Trash2 size={16} /> Clear History
          </button>
        )}
      </div>

      {history.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {history.map(video => video && (
            <VideoCard key={video.id} video={video} onNavigate={onNavigate} showProgress />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📺</p>
          <p className="text-xl font-semibold text-text-primary mb-2">No watch history</p>
          <p className="text-text-muted mb-4">Videos you watch will appear here</p>
          <button onClick={() => onNavigate('browse')} className="px-6 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-light transition-colors">
            Browse Videos
          </button>
        </div>
      )}
    </div>
  );
}
