import videosData from '@/data/videos.json';
import actorsData from '@/data/actors.json';
import categoriesData from '@/data/categories.json';
import networksData from '@/data/networks.json';
import studiosData from '@/data/studios.json';
import playlistsData from '@/data/playlists.json';
import settingsData from '@/data/settings.json';
import type { Video, Actor, Category, Network, Studio, Playlist, Settings } from '@/types';

const videos = videosData as Video[];
const actors = actorsData as Actor[];
const categories = categoriesData as Category[];
const networks = networksData as Network[];
const studios = studiosData as Studio[];
const playlists = playlistsData as Playlist[];
const settings = settingsData as Settings;

export function useData() {
  const getVideo = (id: string) => videos.find(v => v.id === id);
  const getVideoBySlug = (slug: string) => videos.find(v => v.slug === slug);
  const getActor = (id: string) => actors.find(a => a.id === id);
  const getActorBySlug = (slug: string) => actors.find(a => a.slug === slug);
  const getCategory = (id: string) => categories.find(c => c.id === id);
  const getCategoryBySlug = (slug: string) => categories.find(c => c.slug === slug);
  const getNetwork = (id: string) => networks.find(n => n.id === id);
  const getStudio = (id: string) => studios.find(s => s.id === id);
  const getPlaylist = (id: string) => playlists.find(p => p.id === id);

  const getVideoActors = (video: Video) => video.actorIds.map(id => getActor(id)).filter(Boolean) as Actor[];
  const getVideoCategories = (video: Video) => video.categoryIds.map(id => getCategory(id)).filter(Boolean) as Category[];
  const getVideoNetwork = (video: Video) => video.networkId ? getNetwork(video.networkId) : null;
  const getVideoStudio = (video: Video) => video.studioId ? getStudio(video.studioId) : null;

  const getActorVideos = (actorId: string) => videos.filter(v => v.actorIds.includes(actorId));
  const getCategoryVideos = (categoryId: string) => videos.filter(v => v.categoryIds.includes(categoryId));
  const getPlaylistVideos = (playlistId: string) => {
    const pl = getPlaylist(playlistId);
    if (!pl) return [];
    return pl.videoIds.map(id => getVideo(id)).filter(Boolean) as Video[];
  };

  const getFeaturedVideos = () => videos.filter(v => v.isFeatured);
  const getTrendingVideos = () => videos.filter(v => v.isTrending);
  const getLatestVideos = () => [...videos].sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
  const getPopularVideos = () => [...videos].sort((a, b) => b.views - a.views);
  const getTopRatedVideos = () => [...videos].sort((a, b) => b.rating - a.rating);

  const getRelatedVideos = (video: Video, limit = 6) => {
    const scored = videos
      .filter(v => v.id !== video.id)
      .map(v => {
        let score = 0;
        v.categoryIds.forEach(c => { if (video.categoryIds.includes(c)) score += 3; });
        v.actorIds.forEach(a => { if (video.actorIds.includes(a)) score += 5; });
        v.tags.forEach(t => { if (video.tags.includes(t)) score += 1; });
        if (v.networkId === video.networkId && video.networkId) score += 2;
        if (v.studioId === video.studioId && video.studioId) score += 2;
        return { video: v, score };
      })
      .sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(s => s.video);
  };

  const getRelatedActors = (actor: Actor, limit = 6) => {
    const coactors = new Map<string, number>();
    videos.forEach(v => {
      if (v.actorIds.includes(actor.id)) {
        v.actorIds.forEach(aid => {
          if (aid !== actor.id) {
            coactors.set(aid, (coactors.get(aid) || 0) + 1);
          }
        });
      }
    });
    return Array.from(coactors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => getActor(id))
      .filter(Boolean) as Actor[];
  };

  const searchAll = (query: string) => {
    const q = query.toLowerCase().trim();
    if (!q) return { videos: [], actors: [], categories: [], tags: [] };

    const matchedVideos = videos.filter(v =>
      v.title.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      v.tags.some(t => t.toLowerCase().includes(q))
    );
    const matchedActors = actors.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.nationality.toLowerCase().includes(q)
    );
    const matchedCategories = categories.filter(c =>
      c.name.toLowerCase().includes(q)
    );
    const allTags = [...new Set(videos.flatMap(v => v.tags))];
    const matchedTags = allTags.filter(t => t.toLowerCase().includes(q));

    return { videos: matchedVideos, actors: matchedActors, categories: matchedCategories, tags: matchedTags };
  };

  const filterVideos = (filters: {
    categoryIds?: string[];
    actorIds?: string[];
    tags?: string[];
    networkId?: string;
    studioId?: string;
    type?: string;
    resolution?: string;
    language?: string;
    sortBy?: string;
    query?: string;
  }) => {
    let result = [...videos];

    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(v =>
        v.title.toLowerCase().includes(q) ||
        v.tags.some(t => t.includes(q))
      );
    }
    if (filters.categoryIds?.length) {
      result = result.filter(v => filters.categoryIds!.some(c => v.categoryIds.includes(c)));
    }
    if (filters.actorIds?.length) {
      result = result.filter(v => filters.actorIds!.every(a => v.actorIds.includes(a)));
    }
    if (filters.tags?.length) {
      result = result.filter(v => filters.tags!.some(t => v.tags.includes(t)));
    }
    if (filters.networkId) {
      result = result.filter(v => v.networkId === filters.networkId);
    }
    if (filters.studioId) {
      result = result.filter(v => v.studioId === filters.studioId);
    }
    if (filters.type) {
      result = result.filter(v => v.type === filters.type);
    }
    if (filters.resolution) {
      result = result.filter(v => v.resolution === filters.resolution);
    }
    if (filters.language) {
      result = result.filter(v => v.language === filters.language);
    }

    switch (filters.sortBy) {
      case 'newest': result.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()); break;
      case 'oldest': result.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()); break;
      case 'popular': result.sort((a, b) => b.views - a.views); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'duration-asc': result.sort((a, b) => a.duration - b.duration); break;
      case 'duration-desc': result.sort((a, b) => b.duration - a.duration); break;
      case 'title': result.sort((a, b) => a.title.localeCompare(b.title)); break;
      default: break;
    }

    return result;
  };

  const getAllTags = () => [...new Set(videos.flatMap(v => v.tags))].sort();
  const getAllLanguages = () => [...new Set(videos.map(v => v.language))].sort();
  const getAllResolutions = () => [...new Set(videos.map(v => v.resolution))];

  return {
    videos, actors, categories, networks, studios, playlists, settings,
    getVideo, getVideoBySlug, getActor, getActorBySlug, getCategory, getCategoryBySlug,
    getNetwork, getStudio, getPlaylist,
    getVideoActors, getVideoCategories, getVideoNetwork, getVideoStudio,
    getActorVideos, getCategoryVideos, getPlaylistVideos,
    getFeaturedVideos, getTrendingVideos, getLatestVideos, getPopularVideos, getTopRatedVideos,
    getRelatedVideos, getRelatedActors, searchAll, filterVideos,
    getAllTags, getAllLanguages, getAllResolutions,
  };
}
