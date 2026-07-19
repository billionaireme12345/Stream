import { useState, useRef, useCallback, useEffect } from 'react';
import { Maximize, Minimize, ExternalLink, MonitorPlay } from 'lucide-react';

interface VideoPlayerProps {
  embedUrl: string;
  externalPlayerUrl?: string;
  title: string;
  onLoad?: () => void;
}

/**
 * Smart Video Player Component
 * 
 * Supports multiple embed formats with full-screen capability:
 * 
 * ── TELEGRAM EMBED FORMATS ──────────────────────────────────────────
 * 
 * 1. Telegram Post Widget (Recommended - uses official widget script):
 *    "telegram:channelname/postid"
 *    Example: "telegram:mychannel/42"
 *    → Renders via <script src="telegram.org/js/telegram-widget.js">
 *    → Shows full Telegram post card with built-in video player
 *    → Fullscreen: use the browser fullscreen button we provide
 * 
 * 2. Telegram iframe embed (direct iframe):
 *    "https://t.me/channelname/postid?embed=1&mode=video"
 *    Example: "https://t.me/mychannel/42?embed=1&mode=video"
 *    → Embeds as iframe, supports allowfullscreen
 * 
 * ── STANDARD EMBED FORMATS ──────────────────────────────────────────
 * 
 * 3. YouTube:
 *    "https://www.youtube.com/embed/VIDEO_ID"
 * 
 * 4. Vimeo:
 *    "https://player.vimeo.com/video/VIDEO_ID"
 * 
 * 5. Any iframe-compatible URL:
 *    Any https URL → embedded as iframe
 * 
 * 6. Direct video file URL (.mp4, .webm, .ogg):
 *    "https://example.com/video.mp4"
 *    → Renders native <video> element with full controls
 * 
 * ── EXTERNAL PLAYER LINK ────────────────────────────────────────────
 * 
 * Set externalPlayerUrl to provide an "Open in External Player" button.
 * For Telegram videos use: "tg://resolve?domain=channelname&post=postid"
 * or the direct t.me link: "https://t.me/channelname/postid"
 * 
 * ── HOW TO ADD A TELEGRAM VIDEO ─────────────────────────────────────
 * 
 * In videos.json, set the fields like this:
 * 
 * {
 *   "embedUrl": "telegram:mychannel/123",
 *   "externalPlayerUrl": "https://t.me/mychannel/123"
 * }
 * 
 * OR for direct iframe embed:
 * 
 * {
 *   "embedUrl": "https://t.me/mychannel/123?embed=1&mode=video",
 *   "externalPlayerUrl": "https://t.me/mychannel/123"
 * }
 */

// Detect if URL is a direct video file
function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|m3u8)(\?.*)?$/i.test(url);
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
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Handle Telegram widget script injection
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

  // ─── Render: Telegram Widget ───
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
          telegramUrl={`https://t.me/${telegramWidget.channel}/${telegramWidget.postId}`}
        />
      </div>
    );
  }

  // ─── Render: Direct Video File ───
  if (isDirectVideo(embedUrl)) {
    return (
      <div ref={containerRef} className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
        <video
          src={embedUrl}
          controls
          controlsList="nodownload"
          className="w-full h-full"
          playsInline
          preload="metadata"
          onLoadedData={() => onLoad?.()}
        >
          Your browser does not support the video tag.
        </video>
        <PlayerControls
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          externalPlayerUrl={externalPlayerUrl}
        />
      </div>
    );
  }

  // ─── Render: Telegram iframe embed ───
  if (isTelegramEmbed(embedUrl)) {
    const normalizedUrl = normalizeTelegramUrl(embedUrl);
    return (
      <div ref={containerRef} className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl ${isFullscreen ? 'flex items-center justify-center h-full' : ''}`}>
        <iframe
          src={normalizedUrl}
          title={title}
          className={`w-full border-0 ${isFullscreen ? 'h-full max-w-5xl mx-auto' : 'min-h-[400px] md:min-h-[500px] lg:min-h-[600px]'}`}
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          sandbox="allow-scripts allow-same-origin allow-popups allow-presentation allow-popups-to-escape-sandbox"
          onLoad={() => onLoad?.()}
        />
        <PlayerControls
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          externalPlayerUrl={externalPlayerUrl}
          telegramUrl={embedUrl.split('?')[0]}
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


// ─── Floating Control Bar ───
function PlayerControls({
  isFullscreen,
  onToggleFullscreen,
  externalPlayerUrl,
  telegramUrl,
}: {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  externalPlayerUrl?: string;
  telegramUrl?: string;
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
        {telegramUrl && (
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all backdrop-blur-sm"
            title="Open in Telegram"
          >
            <MonitorPlay size={14} /> Open in Telegram
          </a>
        )}
        {externalPlayerUrl && externalPlayerUrl !== telegramUrl && (
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
