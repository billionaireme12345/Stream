import { useState, useRef, useCallback, useEffect } from 'react';
import { Maximize, Minimize, ExternalLink, Play, AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  embedUrl: string;
  externalPlayerUrl?: string;
  title: string;
  onLoad?: () => void;
}

/**
 * Smart Video Player Component (Branding-Free & Streaming Optimized)
 * 
 * ── HOW TO SOLVE "MEDIA IS TOO BIG" & REMOVE BRANDING ───────────────
 * 
 * 1. Direct Stream / HTTP Stream Proxy (RECOMMENDED):
 *    To bypass Telegram's 50MB browser widget limit and remove all sender/channel
 *    names, route your Telegram files through an HTTP streaming proxy (like 
 *    TG-File-Stream-Bot or your own backend) and pass the stream URL:
 * 
 *    {
 *      "embedUrl": "https://your-proxy-domain.com/stream/file_id",
 *      "externalPlayerUrl": "https://your-proxy-domain.com/stream/file_id"
 *    }
 *    → Automatically renders a clean, native HTML5 <video> player.
 *    → Supports unlimited file sizes with zero Telegram logos or channel names.
 * 
 * 2. Standard Embed Formats:
 *    → YouTube: "https://www.youtube.com/embed/VIDEO_ID"
 *    → Vimeo: "https://player.vimeo.com/video/VIDEO_ID"
 *    → Direct Files: "https://example.com/video.mp4"
 */

// Detect if URL is a direct video file OR an HTTP stream proxy endpoint
function isDirectVideo(url: string): boolean {
  // Matches file extensions (.mp4, .m3u8, etc.) OR stream proxy API paths (/stream/, /video/, /file/)
  return /\.(mp4|webm|ogg|m3u8|mov|mkv)(\?.*)?$/i.test(url) || 
         /\/(stream|video|file|download)\//i.test(url);
}

// Detect Telegram widget shorthand format: "telegram:channel/postid"
function parseTelegramWidget(url: string): { channel: string; postId: string } | null {
  const match = url.match(/^telegram:([^/]+)\/(\d+)$/);
  if (match) return { channel: match[1], postId: match[2] };
  return null;
}

// Detect Telegram t.me embed URL
function isTelegramEmbed(url: string): boolean {
  return /^https?:\/\/t\.me\//.test(url);
}

// Ensure Telegram URL has embed params
function normalizeTelegramUrl(url: string): string {
  const u = new URL(url);
  if (!u.searchParams.has('embed')) u.searchParams.set('embed', '1');
  if (!u.searchParams.has('mode')) u.searchParams.set('mode', 'video');
  return u.toString();
}

export default function VideoPlayer({ embedUrl, externalPlayerUrl, title, onLoad }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const telegramRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [streamError, setStreamError] = useState(false);

  // Listen for fullscreen changes
  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  }, []);

  // Keyboard shortcut: F for fullscreen
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [toggleFullscreen]);

  // Handle Telegram widget script injection (Fallback only)
  const telegramWidget = parseTelegramWidget(embedUrl);

  useEffect(() => {
    if (!telegramWidget || !telegramRef.current) return;

    // Clear previous content
    telegramRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-post', `${telegramWidget.channel}/${telegramWidget.postId}`);
    script.setAttribute('data-width', '100%');
    script.setAttribute('data-userpic', 'false');
    script.setAttribute('data-color', '6366F1');
    script.setAttribute('data-dark', '1');
    script.setAttribute('data-dark-color', '6366F1');
    script.async = true;

    script.onload = () => onLoad?.();

    telegramRef.current.appendChild(script);
  }, [telegramWidget?.channel, telegramWidget?.postId]);

  // ─── Render: Direct Video Stream (RECOMMENDED FOR LARGE FILES & NO BRANDING) ───
  if (isDirectVideo(embedUrl)) {
    return (
      <div ref={containerRef} className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
        {!streamError ? (
          <video
            ref={videoRef}
            src={embedUrl}
            controls
            controlsList="nodownload"
            className="w-full h-full object-contain"
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            onLoadedData={() => {
              setStreamError(false);
              onLoad?.();
            }}
            onError={() => setStreamError(true)}
          >
            Your browser does not support HTML5 video streaming.
          </video>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-gray-300">
            <AlertCircle className="w-12 h-12 text-red-500 mb-3 animate-pulse" />
            <p className="text-lg font-semibold text-white">Stream Unavailable or Too Large</p>
            <p className="text-sm text-gray-400 mt-1 max-w-md">
              The direct streaming connection failed to load. Please verify your streaming proxy backend is running.
            </p>
          </div>
        )}
        <PlayerControls
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          externalPlayerUrl={externalPlayerUrl}
        />
      </div>
    );
  }

  // ─── Render: Telegram Widget (Legacy Fallback) ───
  if (telegramWidget) {
    return (
      <div ref={containerRef} className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl ${isFullscreen ? 'flex items-center justify-center' : ''}`}>
        <div
          ref={telegramRef}
          className={`w-full ${isFullscreen ? 'max-w-5xl mx-auto' : 'min-h-[300px] md:min-h-[400px] lg:min-h-[500px]'}`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
        <PlayerControls
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          externalPlayerUrl={externalPlayerUrl}
        />
      </div>
    );
  }

  // ─── Render: Telegram iframe embed (With CSS Clipping to hide Channel/Sender Header) ───
  if (isTelegramEmbed(embedUrl)) {
    const normalizedUrl = normalizeTelegramUrl(embedUrl);
    return (
      <div ref={containerRef} className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl ${isFullscreen ? 'flex items-center justify-center h-full' : ''}`}>
        {/* Wrapper applies negative top/bottom margins to clip out the Telegram channel & sender name header bar */}
        <div className="w-full h-full overflow-hidden relative -top-10 -bottom-10 md:-top-12 md:-bottom-12">
          <iframe
            src={normalizedUrl}
            title={title}
            className={`w-full border-0 ${isFullscreen ? 'h-[calc(100%+5rem)] max-w-5xl mx-auto' : 'min-h-[450px] md:min-h-[560px] lg:min-h-[660px]'}`}
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            sandbox="allow-scripts allow-same-origin allow-popups allow-presentation allow-popups-to-escape-sandbox"
            onLoad={() => onLoad?.()}
          />
        </div>
        <PlayerControls
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          externalPlayerUrl={externalPlayerUrl}
        />
      </div>
    );
  }

  // ─── Render: Standard iframe (YouTube, Vimeo, etc.) ───
  return (
    <div ref={containerRef} className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full border-0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        onLoad={() => onLoad?.()}
      />
      <PlayerControls
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        externalPlayerUrl={externalPlayerUrl}
      />
    </div>
  );
}


// ─── Floating Control Bar (Clean & Branding-Free) ───
function PlayerControls({
  isFullscreen,
  onToggleFullscreen,
  externalPlayerUrl,
}: {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  externalPlayerUrl?: string;
}) {
  const [visible, setVisible] = useState(true);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showControls = useCallback(() => {
    setVisible(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => setVisible(false), 3000);
  }, []);

  useEffect(() => {
    showControls();
  }, []);

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'} bg-gradient-to-t from-black/80 to-transparent z-10`}
      onMouseEnter={() => { setVisible(true); if (hideTimeout.current) clearTimeout(hideTimeout.current); }}
      onMouseLeave={showControls}
      onMouseMove={showControls}
    >
      <div className="flex items-center gap-2">
        {/* Only show External Player button if it's explicitly provided, removing Telegram-specific references */}
        {externalPlayerUrl && !externalPlayerUrl.includes('t.me') && !externalPlayerUrl.includes('tg://') && (
          <a
            href={externalPlayerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all backdrop-blur-sm"
            title="Open in External Player"
          >
            <ExternalLink size={14} /> External Player
          </a>
        )}
      </div>

      <button
        onClick={onToggleFullscreen}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all backdrop-blur-sm"
        title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
      >
        {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
        {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      </button>
    </div>
  );
}
