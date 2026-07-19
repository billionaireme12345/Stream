export interface User {
  id: string;
  mobile: string;
  password: string;
  name: string;
  role: string;
  status: string;
  avatar: string;
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  previewUrl: string;
  embedUrl: string;
  externalPlayerUrl: string;
  duration: number;
  releaseDate: string;
  resolution: string;
  language: string;
  type: 'professional' | 'homemade';
  categoryIds: string[];
  actorIds: string[];
  networkId: string;
  studioId: string;
  tags: string[];
  views: number;
  likes: number;
  rating: number;
  isFeatured: boolean;
  isTrending: boolean;
}

export interface Actor {
  id: string;
  name: string;
  slug: string;
  photo: string;
  biography: string;
  birthDate: string;
  nationality: string;
  stats: {
    totalVideos: number;
    totalViews: number;
    avgRating: number;
  };
  tags: string[];
  socialLinks: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
}

export interface Network {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
}

export interface Studio {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
}

export interface Playlist {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  videoIds: string[];
  isPublic: boolean;
}

export interface Settings {
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  defaultTheme: string;
  defaultLanguage: string;
  itemsPerPage: number;
  enableComments: boolean;
  enableSharing: boolean;
  heroAutoplay: boolean;
  previewDuration: number;
  redirectOnFailedLogin: string;
  maxLoginAttempts: number;
  sessionDuration: number;
}

export interface UserPreferences {
  favorites: string[];
  watchLater: string[];
  watchHistory: { videoId: string; timestamp: number; progress: number }[];
  theme: 'dark' | 'light';
}
