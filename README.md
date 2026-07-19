# StreamVault - Private Video Streaming Platform

A production-ready, invitation-only private video streaming website built with React, TypeScript, Vite, and Tailwind CSS. Fully deployable on GitHub Pages with no backend required.

## Features

### 🎬 Video Features
- High-quality video thumbnails with hover preview
- Embedded video player (supports Telegram, YouTube, etc.)
- External player link support
- Video metadata (duration, resolution, language, release date)
- Related videos and recommendations

### 👤 User Features
- Mobile number + password authentication
- Favorites and Watch Later lists
- Watch history with resume playback
- Continue watching progress tracking
- Dark/Light theme toggle
- Keyboard shortcuts (H=Home, B=Browse, F=Favorites, /=Search)

### 🔍 Search & Discovery
- Instant search with suggestions
- Advanced filtering (category, actors, tags, resolution, etc.)
- Multiple sorting options
- Browse by category, actor, network, studio

### 🎨 UI/UX
- Premium modern design
- Responsive layout (mobile, tablet, desktop)
- Smooth animations and transitions
- Skeleton loading states
- Toast notifications
- Collapsible sidebar

## Project Structure

```
src/
├── data/           # Editable JSON data files
│   ├── users.json      # User credentials (mobile, password, name)
│   ├── videos.json     # Video metadata and embed URLs
│   ├── actors.json     # Actor profiles
│   ├── categories.json # Category definitions
│   ├── playlists.json  # Curated playlists
│   ├── networks.json   # Network/channel info
│   ├── studios.json    # Studio info
│   └── settings.json   # Site configuration
├── components/     # Reusable UI components
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── store/          # State management
├── types/          # TypeScript types
└── utils/          # Utility functions
```

## Managing Content

### Adding Users
Edit `src/data/users.json`:
```json
{
  "id": "user_004",
  "mobile": "9999999999",
  "password": "SecurePass@123",
  "name": "New User",
  "role": "viewer",
  "status": "active",
  "avatar": ""
}
```

### Adding Videos
Edit `src/data/videos.json`:
```json
{
  "id": "vid_013",
  "title": "Video Title",
  "slug": "video-title",
  "description": "Video description...",
  "thumbnail": "https://example.com/thumb.jpg",
  "previewUrl": "",
  "embedUrl": "https://www.youtube.com/embed/VIDEO_ID",
  "externalPlayerUrl": "",
  "duration": 3600,
  "releaseDate": "2025-01-15",
  "resolution": "4K",
  "language": "English",
  "type": "professional",
  "categoryIds": ["cat_001"],
  "actorIds": ["act_001"],
  "networkId": "net_001",
  "studioId": "stu_001",
  "tags": ["action", "thriller"],
  "views": 10000,
  "likes": 500,
  "rating": 4.5,
  "isFeatured": true,
  "isTrending": false
}
```

### Adding Actors
Edit `src/data/actors.json`:
```json
{
  "id": "act_007",
  "name": "Actor Name",
  "slug": "actor-name",
  "photo": "https://example.com/photo.jpg",
  "biography": "Actor biography...",
  "birthDate": "1990-01-01",
  "nationality": "American",
  "stats": { "totalVideos": 5, "totalViews": 100000, "avgRating": 4.5 },
  "tags": ["action-star"],
  "socialLinks": {}
}
```

## Deployment to GitHub Pages

### Automatic Deployment (Recommended)

1. Push your code to GitHub
2. Go to **Settings** > **Pages**
3. Under "Build and deployment", select **GitHub Actions**
4. Push to the `main` branch - deployment happens automatically

Your site will be available at: `https://<username>.github.io/<repository-name>/`

### Manual Deployment

```bash
# Install dependencies
npm install

# Build the project
npm run build

# The dist/index.html is a single self-contained file
# Upload it to any static hosting service
```

## Login Credentials (Default)

| Mobile | Password | Name |
|--------|----------|------|
| 9876543210 | Pass@123 | John Doe |
| 9876543211 | Admin@456 | Jane Smith |
| 1234567890 | Demo@789 | Demo User |

**⚠️ Important:** Change these credentials before deploying to production!

## Security Notes

- Failed login attempts redirect to Google (configurable in settings.json)
- No registration page - users are managed via JSON file
- Session stored in browser sessionStorage (cleared on tab close)
- User preferences stored in localStorage

## Customization

### Site Settings
Edit `src/data/settings.json`:
```json
{
  "siteName": "StreamVault",
  "siteTagline": "Private Premium Streaming",
  "redirectOnFailedLogin": "https://google.com",
  "defaultTheme": "dark"
}
```

### Embed URLs & Telegram Videos

The platform supports various embed formats with full-screen capability:

#### Telegram Video Embeds (2 methods):

**Method 1 — Telegram Widget (Recommended):**
```json
{
  "embedUrl": "telegram:channelname/postid",
  "externalPlayerUrl": "https://t.me/channelname/postid"
}
```
Example: `"embedUrl": "telegram:mychannel/42"`

Uses the official Telegram widget script. Renders the full Telegram post card
with its built-in video player. The custom fullscreen button wraps the whole
widget into browser fullscreen. "Open in Telegram" link lets the user jump
to the native app.

**Method 2 — Telegram iframe embed:**
```json
{
  "embedUrl": "https://t.me/channelname/postid?embed=1&mode=video",
  "externalPlayerUrl": "https://t.me/channelname/postid"
}
```
Loads the Telegram post directly in an iframe. `?embed=1` activates the
embeddable version; `&mode=video` auto-focuses the video player.

#### How to get the channel name & post ID

1. Open the **public** Telegram channel in a browser (e.g. `https://t.me/mychannel`)
2. Click/tap on the video post you want to embed
3. The URL will look like `https://t.me/mychannel/123`
4. Channel name = `mychannel`, Post ID = `123`
5. Use either format above in your `videos.json`

> ⚠️ Only **public** channels/groups can be embedded. Private content cannot be embedded.

#### Other supported formats:
- **YouTube:** `https://www.youtube.com/embed/VIDEO_ID`
- **Vimeo:** `https://player.vimeo.com/video/VIDEO_ID`
- **Direct video:** `https://example.com/video.mp4` (mp4, webm, ogg)
- **Any iframe-compatible URL**

#### External Player Link
Set `externalPlayerUrl` to give users a button that opens the video in
Telegram's native app or another external player:
```json
{
  "externalPlayerUrl": "https://t.me/channelname/postid"
}
```

#### Fullscreen
All embed types include a **Fullscreen** button (also triggered by pressing `F`).
For Telegram embeds, this uses the browser Fullscreen API to expand the
entire player container. YouTube/Vimeo use their own built-in fullscreen.
Direct `.mp4` files use the native `<video>` element controls.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **Lucide React** - Icons
- **vite-plugin-singlefile** - Single HTML output

## License

Private use only. All rights reserved.
