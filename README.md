<p align="center">
  <img src="public/icons/tidytube-logo-128.png" width="96" height="96" alt="TidyTube Logo" />
</p>

<h1 align="center">TidyTube</h1>

<p align="center">
  <strong>Cross-browser extension to declutter YouTube, redirect Shorts into standard video players, and reclaim your focus.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-MV3-blue?style=flat-square" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/Framework-WXT-orange?style=flat-square" alt="WXT" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Browsers-Chrome%20%7C%20Firefox%20%7C%20Brave%20%7C%20Edge-purple?style=flat-square" alt="Browser Support" />
</p>

---

## 📖 Overview

**TidyTube** is a fast, lightweight, route-aware browser extension built for students, developers, and intentional learners who rely on YouTube for lectures, tutorials, and deep work.

Algorithmic recommendations, infinite-scrolling Shorts feeds, and comment debates often turn a 10-minute search for a tutorial into hours of wasted time. TidyTube removes these distraction vectors while preserving the core video player experience. It features zero-latency toggle controls accessible anytime directly from the browser extension popup.

---

## ✨ Features

### 1. 🏠 Homepage Decluttering
* **Hide Recommendation Feed**: Replaces the endless algorithmic homepage grid with a clean, distraction-free space.
* **Hide Shorts Shelves**: Strips out Shorts carousels and reels from the homepage.

### 2. 🔍 Search Results Focus
* **Hide Shorts in Search**: Filters out vertical Shorts shelves and reels, keeping search results strictly focused on relevant long-form content.

### 3. 🎬 Distraction-Free Watch Page
* **Master Switch**: Toggle all watch-page distractions at once with a single click.
* **Granular Sub-toggles**:
  * **Sidebar Recommendations**: Removes the distracting "Up Next" / related videos column.
  * **Comments & Live Chat**: Silences the comments section and hides live chat panels.
  * **End-Screen Video Cards**: Prevents recommended tiles from obscuring video endings.
  * **Video Info Cards**: Suppresses popup teaser cards during playback.

### 4. 🔀 Shorts to Standard Player Redirect
* Automatically reroutes `/shorts/:id` URLs to the standard `/watch?v=:id` player.
* Gives you back standard playback controls: seek bar, scrubbing, playback speed adjustment, keyboard shortcuts, and theater mode.
* Client-side link interception captures clicks across the YouTube SPA for instant navigation without extra page loads.

### 5. ⏱️ Playlist Total Duration Calculator
* Displays cumulative playlist runtime directly in the `/playlist` sidebar beneath video/view counts.
* **Dynamic Loading Support**: Smoothly calculates time across large playlists as additional batches are lazily loaded on scroll.
* **Performance Caching**: Uses an $O(\Delta N)$ cache per video ID to eliminate lag and redundant DOM recalculations.
* **Smart Edge-Case Handling**: Gracefully skips unavailable/private videos and identifies infinite continuous mixes (`list=RD...`).

---

## 🎨 Icons & Assets

All extension icons and branding assets are located in the [`/public/icons`](file:///home/blackbeard/Downloads/CODE/Extension/TidyTube/public/icons) directory:

```
public/icons/
├── tidytube-logo-16.png     # Browser toolbar favicon (16x16)
├── tidytube-logo-24.png     # Context menus / retina favicon (24x24)
├── tidytube-logo-48.png     # Extensions management page (48x48)
├── tidytube-logo-96.png     # High-DPI screens & manifest (96x96)
└── tidytube-logo-128.png    # Web store & high-resolution display (128x128)
```

The icons are automatically bundled into the `.output/` directory during build by WXT.

---

## 📁 Project Structure

```
TidyTube/
├── devpost/                 # Product specifications, PRD, and planning docs
│   ├── prd.md
│   ├── scope.md
│   ├── spec.md
│   └── playlistTime.md
├── entrypoints/
│   ├── background.ts        # Background service worker (lifecycle & storage init)
│   ├── content.ts           # YouTube content script (SPA listeners & injectors)
│   └── popup/               # Browser action toolbar popup (React + Tailwind)
│       ├── App.tsx
│       ├── index.html
│       ├── main.tsx
│       └── style.css
├── public/
│   └── icons/               # Extension icons (16, 24, 48, 96, 128px)
├── src/
│   ├── components/          # Reusable popup UI components (Header, CheckboxItem, ToggleGroup)
│   ├── types/               # TypeScript interfaces & default settings schema
│   └── utils/
│       ├── playlist-timer.ts   # Playlist total duration calculator & DOM observer
│       ├── shorts-redirector.ts # Client-side URL & click redirector for Shorts
│       ├── storage.ts          # Unified cross-browser storage wrapper
│       └── style-injector.ts   # Dynamic zero-flicker CSS injection engine
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── wxt.config.ts            # WXT & extension manifest configuration
```

---

## 🛠️ Tech Stack

* **Framework:** [WXT (Next-Gen Web Extension Framework)](https://wxt.dev/)
* **UI:** [React 18](https://react.dev/) + [Tailwind CSS 3.4](https://tailwindcss.com/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Target:** Manifest V3 (MV3) for Chromium & Firefox
* **Build Tool:** [Vite](https://vitejs.dev/)

---

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (version 18 or higher recommended)
* [npm](https://www.npmjs.com/) (or pnpm / yarn)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/TidyTube.git
   cd TidyTube
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development Mode

Run the local development server with instant Hot Module Replacement (HMR):

* **Chrome / Chromium:**
  ```bash
  npm run dev
  ```
* **Firefox:**
  ```bash
  npm run dev:firefox
  ```

This will launch a dedicated browser instance with the extension pre-loaded and auto-reloading upon file changes.

### Production Build

Compile and bundle the extension into `.output/`:

* **Chrome / Chromium (Manifest V3):**
  ```bash
  npm run build
  ```
* **Firefox:**
  ```bash
  npm run build:firefox
  ```

To generate zip archives ready for store distribution:
```bash
npm run zip          # Chromium (.output/tidytube-*-chrome.zip)
npm run zip:firefox  # Firefox (.output/tidytube-*-firefox.zip)
```

---

## 🧩 Loading the Extension Manually

If you prefer testing the compiled build in your personal browser profile:

### Google Chrome / Brave / Microsoft Edge
1. Run `npm run build`.
2. Open your browser and navigate to `chrome://extensions` (or `brave://extensions`, `edge://extensions`).
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **Load unpacked**.
5. Select the `.output/chrome-mv3` folder inside this project directory.

### Mozilla Firefox
1. Run `npm run build:firefox`.
2. Navigate to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...**.
4. Select the `manifest.json` inside `.output/firefox-mv2` (or `.output/firefox-mv3`).

---

## ⚙️ Available Settings & Defaults

| Setting | Popup Label | Default | Description |
| :--- | :--- | :---: | :--- |
| `hideHomeRecommendations` | Hide home recommendation feed | `false` | Hides algorithmic grid feed on `youtube.com/` |
| `hideHomeShorts` | Hide Shorts shelves | `false` | Hides Shorts carousel shelves on homepage |
| `hideSearchShorts` | Hide Shorts in search results | `false` | Strips vertical Shorts shelves from search results |
| `hideWatchDistractions` | Hide all watch distractions | `false` | Master toggle controlling all watch-page distraction elements |
| `hideWatchRecommendations` | Sidebar recommendations | `false` | Hides the recommended video sidebar column |
| `hideWatchComments` | Comments & live chat | `false` | Hides comments section and live chat panels |
| `hideWatchEndScreen` | End-screen video cards | `false` | Suppresses end-of-video recommendation overlays |
| `hideWatchInfoCards` | Video info teaser cards | `false` | Suppresses in-video interactive teaser cards |
| `redirectShorts` | Redirect Shorts to standard player | `false` | Reroutes `/shorts/:id` to `/watch?v=:id` |
| `showPlaylistDuration` | Show playlist total duration | `true` | Calculates and displays total duration badge on `/playlist` |

All settings persist across sessions using the browser's storage API and synchronize instantly with active tabs without requiring a page refresh.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
