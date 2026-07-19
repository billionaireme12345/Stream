import { useData } from '@/hooks/useData';

interface CategoriesPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export default function CategoriesPage({ onNavigate }: CategoriesPageProps) {
  const { categories, getCategoryVideos } = useData();

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Categories</h1>
        <p className="text-text-muted text-sm mt-1">Browse content by category</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map(cat => {
          const videoCount = getCategoryVideos(cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => onNavigate('browse', { category: cat.id })}
              className="group p-6 rounded-xl bg-surface border border-border/50 hover:border-primary/30 transition-all text-left card-hover relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl" style={{ background: cat.color }} />
              <span className="text-4xl block mb-3">{cat.icon}</span>
              <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">{cat.name}</h3>
              <p className="text-xs text-text-muted mt-1 line-clamp-2">{cat.description}</p>
              <p className="text-xs text-text-muted mt-3 font-medium">{videoCount} {videoCount === 1 ? 'video' : 'videos'}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
