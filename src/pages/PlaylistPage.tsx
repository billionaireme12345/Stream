import { ChevronRight, ListVideo } from 'lucide-react';
import VideoCard from '@/components/VideoCard';
import { useData } from '@/hooks/useData';

interface PlaylistPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  params: Record<string, string>;
}

export default function PlaylistPage({ onNavigate, params }: PlaylistPageProps) {
  const { getPlaylist, getPlaylistVideos } = useData();

  const playlist = getPlaylist(params.id);

  if (!playlist) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">📋</p>
        <p className="text-xl font-semibold text-text-primary mb-2">Playlist not found</p>
        <button onClick={() => onNavigate('home')} className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-white font-medium">
          Go Home
        </button>
      </div>
    );
  }

  const videos = getPlaylistVideos(playlist.id);

  return (
    <div className="animate-fade-in">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <button onClick={() => onNavigate('home')} className="hover:text-primary transition-colors">Home</button>
        <ChevronRight size={14} />
        <span className="text-text-secondary">Playlists</span>
        <ChevronRight size={14} />
        <span className="text-text-secondary">{playlist.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start gap-6 mb-8 p-6 bg-surface rounded-2xl border border-border/50">
        <div className="w-40 h-24 rounded-xl overflow-hidden shrink-0 hidden sm:block">
          <img src={playlist.thumbnail} alt={playlist.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ListVideo size={20} className="text-primary" />
            <span className="text-xs font-medium text-primary uppercase tracking-wider">Playlist</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{playlist.name}</h1>
          <p className="text-text-muted text-sm mt-1">{playlist.description}</p>
          <p className="text-xs text-text-muted mt-2">{videos.length} videos</p>
        </div>
      </div>

      {/* Videos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {videos.map(video => (
          <VideoCard key={video.id} video={video} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}
