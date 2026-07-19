import { useCallback, useSyncExternalStore } from 'react';
import type { UserPreferences } from '@/types';

const STORAGE_KEY = 'streamvault_prefs';
const SESSION_KEY = 'streamvault_session';

function getStoredPrefs(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { favorites: [], watchLater: [], watchHistory: [], theme: 'dark' };
}

function savePrefs(prefs: UserPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  window.dispatchEvent(new Event('prefs-change'));
}

let prefsCache = getStoredPrefs();

function subscribe(cb: () => void) {
  const handler = () => {
    prefsCache = getStoredPrefs();
    cb();
  };
  window.addEventListener('prefs-change', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('prefs-change', handler);
    window.removeEventListener('storage', handler);
  };
}

function getSnapshot() {
  return prefsCache;
}

export function usePrefs() {
  const prefs = useSyncExternalStore(subscribe, getSnapshot);

  const toggleFavorite = useCallback((videoId: string) => {
    const p = getStoredPrefs();
    if (p.favorites.includes(videoId)) {
      p.favorites = p.favorites.filter(id => id !== videoId);
    } else {
      p.favorites.push(videoId);
    }
    savePrefs(p);
  }, []);

  const toggleWatchLater = useCallback((videoId: string) => {
    const p = getStoredPrefs();
    if (p.watchLater.includes(videoId)) {
      p.watchLater = p.watchLater.filter(id => id !== videoId);
    } else {
      p.watchLater.push(videoId);
    }
    savePrefs(p);
  }, []);

  const addToHistory = useCallback((videoId: string, progress: number = 0) => {
    const p = getStoredPrefs();
    p.watchHistory = p.watchHistory.filter(h => h.videoId !== videoId);
    p.watchHistory.unshift({ videoId, timestamp: Date.now(), progress });
    if (p.watchHistory.length > 100) p.watchHistory = p.watchHistory.slice(0, 100);
    savePrefs(p);
  }, []);

  const updateProgress = useCallback((videoId: string, progress: number) => {
    const p = getStoredPrefs();
    const entry = p.watchHistory.find(h => h.videoId === videoId);
    if (entry) {
      entry.progress = progress;
      entry.timestamp = Date.now();
    } else {
      p.watchHistory.unshift({ videoId, timestamp: Date.now(), progress });
    }
    savePrefs(p);
  }, []);

  const setTheme = useCallback((theme: 'dark' | 'light') => {
    const p = getStoredPrefs();
    p.theme = theme;
    savePrefs(p);
  }, []);

  const clearHistory = useCallback(() => {
    const p = getStoredPrefs();
    p.watchHistory = [];
    savePrefs(p);
  }, []);

  return {
    prefs,
    toggleFavorite,
    toggleWatchLater,
    addToHistory,
    updateProgress,
    setTheme,
    clearHistory,
    isFavorite: (id: string) => prefs.favorites.includes(id),
    isWatchLater: (id: string) => prefs.watchLater.includes(id),
    getProgress: (id: string) => prefs.watchHistory.find(h => h.videoId === id)?.progress ?? 0,
  };
}

export function getSession(): { userId: string; name: string; mobile: string } | null {
  try {
    const s = sessionStorage.getItem(SESSION_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return null;
}

export function setSession(data: { userId: string; name: string; mobile: string }) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}
