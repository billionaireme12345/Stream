import { Star, Eye, Film, MapPin, Calendar, ChevronRight } from 'lucide-react';
import VideoCard from '@/components/VideoCard';
import { useData } from '@/hooks/useData';
import { formatViews, formatDate } from '@/utils/helpers';

interface ActorPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  params: Record<string, string>;
}

export default function ActorPage({ onNavigate, params }: ActorPageProps) {
  const { getActorBySlug, getActorVideos, getRelatedActors } = useData();

  const actor = getActorBySlug(params.slug);

  if (!actor) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">👤</p>
        <p className="text-xl font-semibold text-text-primary mb-2">Actor not found</p>
        <button onClick={() => onNavigate('actors')} className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-white font-medium">
          Browse Actors
        </button>
      </div>
    );
  }

  const videos = getActorVideos(actor.id);
  const relatedActors = getRelatedActors(actor);

  return (
    <div className="animate-fade-in">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <button onClick={() => onNavigate('home')} className="hover:text-primary transition-colors">Home</button>
        <ChevronRight size={14} />
        <button onClick={() => onNavigate('actors')} className="hover:text-primary transition-colors">Actors</button>
        <ChevronRight size={14} />
        <span className="text-text-secondary">{actor.name}</span>
      </nav>

      {/* Profile Header */}
      <div className="relative rounded-2xl overflow-hidden mb-8">
        {/* Cover - gradient background */}
        <div className="h-48 md:h-56 bg-gradient-to-br from-primary/30 via-surface-light to-accent/20" />

        <div className="relative px-6 pb-6 -mt-16 md:-mt-20">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-5">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden ring-4 ring-surface-dark shadow-2xl">
              <img src={actor.photo} alt={actor.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{actor.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-text-muted">
                <span className="flex items-center gap-1.5"><MapPin size={14} /> {actor.nationality}</span>
                {actor.birthDate && <span className="flex items-center gap-1.5"><Calendar size={14} /> Born {formatDate(actor.birthDate)}</span>}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="px-5 py-3 bg-surface-light rounded-xl border border-border/50">
              <p className="text-2xl font-bold text-text-primary">{actor.stats.totalVideos}</p>
              <p className="text-xs text-text-muted flex items-center gap-1"><Film size={12} /> Videos</p>
            </div>
            <div className="px-5 py-3 bg-surface-light rounded-xl border border-border/50">
              <p className="text-2xl font-bold text-text-primary">{formatViews(actor.stats.totalViews)}</p>
              <p className="text-xs text-text-muted flex items-center gap-1"><Eye size={12} /> Total Views</p>
            </div>
            <div className="px-5 py-3 bg-surface-light rounded-xl border border-border/50">
              <p className="text-2xl font-bold text-gold">{actor.stats.avgRating}</p>
              <p className="text-xs text-text-muted flex items-center gap-1"><Star size={12} /> Avg Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Biography */}
      <div className="mb-8 p-5 bg-surface rounded-xl border border-border/50">
        <h2 className="font-semibold text-text-primary mb-2">Biography</h2>
        <p className="text-sm text-text-secondary leading-relaxed">{actor.biography}</p>
      </div>

      {/* Tags */}
      {actor.tags.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {actor.tags.map(tag => (
              <span key={tag} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-light border border-border/50 text-text-muted">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Videos */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-text-primary mb-4">Videos ({videos.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {videos.map(video => (
            <VideoCard key={video.id} video={video} onNavigate={onNavigate} />
          ))}
        </div>
        {videos.length === 0 && (
          <p className="text-center py-10 text-text-muted">No videos available</p>
        )}
      </div>

      {/* Related Actors */}
      {relatedActors.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">Related Actors</h2>
          <div className="flex gap-5 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {relatedActors.map(a => (
              <button
                key={a.id}
                onClick={() => onNavigate('actor', { slug: a.slug })}
                className="flex flex-col items-center gap-2 flex-shrink-0 group"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-border group-hover:ring-primary transition-all">
                  <img src={a.photo} alt={a.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-xs font-medium text-text-secondary group-hover:text-primary transition-colors text-center w-20 line-clamp-1">
                  {a.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
