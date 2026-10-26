---
doc: spec
status: approved
---

# TidyTube — Technical Spec

## How This Works, In Plain Language

TidyTube has two main pieces that work together: a **Toolbar Popup** where you turn focus toggles on or off, and a **Content Script** running inside YouTube tabs that silences distractions and reroutes Shorts.

1. **The Popup (Your Control Center):** Built with React and styled with Tailwind CSS to match YouTube's dark theme. When you check or uncheck a distraction (like *Hide Homepage recommendation* or *Hide comment*), it saves that state into the browser's local extension storage.
2. **The Content Script (The Invisible Declutterer):** Injected into every `youtube.com` page. When YouTube first opens, the content script reads your preferences into an in-memory cache once. It listens for storage changes, so the instant you tick a box in the popup, it updates its cache and toggles CSS rules directly on the page—hiding or showing elements with zero delay and zero flicker.
3. **The Shorts Redirector:** Whenever you click a `/shorts/:id` link or paste one into the address bar, the content script intercepts the URL and replaces it with standard `/watch?v=:id`, keeping you in the standard video player with normal controls.

Because settings are cached in memory and applied via injected CSS stylesheets, navigating YouTube's single-page app never lags or flashes hidden content.

## The Core Journey Through the System

Traced from `prd.md > The Core Journey`:

1. **User opens popup:** User clicks the TidyTube icon in the browser toolbar. WXT loads `entrypoints/popup/index.html`. React mounts `App.tsx`, reads the current `TidyTubeSettings` from `browser.storage.local`, and renders the checkboxes (default: all unchecked on fresh install).
2. **User toggles a setting:** User clicks a toggle (e.g., checking `Hide Homepage recommendation` or `Hide /watch distraction`). React updates its local state (auto-ticking sub-checkboxes if a master toggle is clicked) and writes the updated `TidyTubeSettings` to `browser.storage.local`.
3. **Storage event fires:** The browser triggers `browser.storage.onChanged` in all active YouTube tabs.
4. **Content script receives update:** `entrypoints/content.ts` receives the event, updates its in-memory `cachedSettings`, and calls `StyleInjector.update(cachedSettings)`.
5. **CSS engine hides elements:** `StyleInjector` updates the dynamic `<style id="tidytube-dynamic-rules">` tag in the `<head>`. YouTube DOM elements matching active selectors (e.g. `ytd-browse[page-subtype="home"] #contents`, `ytd-comments`, `#related`) are hidden immediately by the browser's rendering engine.
6. **User navigates around YouTube:** When clicking between videos or routes, YouTube fires `yt-navigate-finish`. The content script reads `cachedSettings` from memory (0ms latency) and verifies active rules. If on a `/shorts/:id` route and `redirectShorts` is enabled, `ShortsRedirector.redirect()` immediately calls `window.location.replace('/watch?v=' + id)`.

## Stack

- **Framework:** [WXT](https://wxt.dev) (v0.19+) — Next-generation TypeScript browser extension framework built on Vite.
  - *Rationale:* Zero-config bundling for both Manifest V3 Chromium (Chrome, Brave, Edge) and Firefox, native TypeScript support, and fast HMR during development.
- **UI Library:** [React](https://react.dev) (v18 or v19) — Declarative component framework.
  - *Rationale:* Cleanly manages parent-child toggle state (e.g. master `/watch` switch controlling 4 sub-toggles) and enables a modular component structure that is easy to extend.
- **Styling:** [Tailwind CSS](https://tailwindcss.com) (v3+) — Utility-first CSS framework configured with semantic design tokens (`primary`, `onPrimary`, `surface`, `onSurface`, `border`, `accent`) rather than hardcoded hex classes in markup.
  - *Rationale:* Cleanly separates theme definitions into `tailwind.config.js` while effortlessly matching YouTube's dark aesthetic.
- **Language:** [TypeScript](https://www.typescriptlang.org) (v5+) — Typed JavaScript.
  - *Rationale:* Enforces strict types on settings, selectors, and extension messaging to prevent runtime bugs.
- **Browser APIs:** Standard WebExtensions API (`browser.storage.local`, `browser.storage.onChanged`, `browser.runtime`).

## Where It Runs and How Someone Tries It

### Runtime Environment
- Node.js 18+ and npm.
- Chromium-based browser (Google Chrome, Brave, Microsoft Edge) or Mozilla Firefox.

### Commands to Run and Build
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start development mode with auto-reload:**
   ```bash
   npm run dev
   ```
   (Or `npm run dev:firefox` for Firefox).
3. **Build production bundles:**
   ```bash
   npm run build
   ```
   Outputs unpacked extensions in `.output/chrome-mv3` and `.output/firefox-mv2` (or `firefox-mv3`).

### How to Load in Browser for Demo Recording
- **Chrome / Chromium:**
  1. Go to `chrome://extensions`.
  2. Enable **Developer mode** (top-right toggle).
  3. Click **Load unpacked** and select the `.output/chrome-mv3` directory.
  4. Open `https://youtube.com`.
- **Firefox:**
  1. Go to `about:debugging#/runtime/this-firefox`.
  2. Click **Load Temporary Add-on...** and select `manifest.json` inside `.output/firefox-mv2`.
  3. Open `https://youtube.com`.

*Note: Submission for Devpost requires a short (60–90 second) demo video and a public GitHub repository; deployment to web stores is optional and not required.*

## Look and Feel
Carried forward from `prd.md > Look and Feel`, mapped to semantic Tailwind tokens:
- **Semantic Theme Tokens:**
  - `primary`: `#0f0f0f` (YouTube dark background)
  - `onPrimary`: `#f1f1f1` (High-contrast primary text on dark background)
  - `surface`: `#181818` (Card and panel surfaces)
  - `onSurface`: `#aaaaaa` (Muted secondary text / labels)
  - `border`: `#272727` (Subtle divider and border lines)
  - `accent`: `#FF0000` (YouTube Red brand accent for active states)
  - `onAccent`: `#ffffff` (Text on accent)
- **Typography:** System sans-serif / Roboto matching YouTube's font stack.
- **Density:** Compact toolbar popup (320px width) with comfortable touch/click targets and smooth micro-transitions.

## Components

### 1. Popup UI Component Tree
Implements `prd.md > Extension Toolbar Popup` and `prd.md > Look and Feel`.
- **`App.tsx`:** Root popup container; loads saved settings on mount, renders header, checkbox groups, and handles settings mutations.
- **`Header.tsx`:** Displays "TidyTube" title, logo/icon, and focus status.
- **`ToggleGroup.tsx`:** Reusable section container grouping route controls (Homepage, Search, Watch, Shorts).
- **`CheckboxItem.tsx`:** Accessible checkbox component styled with Tailwind, supporting nested indentation and master-child synchronization.

### 2. Storage Manager (`src/utils/storage.ts`)
Implements `prd.md > Instant Reactivity and Caching`, `prd.md > States and Boundaries`.
- Encapsulates `browser.storage.local` get and set calls.
- Provides fallback defaults (`DEFAULT_SETTINGS` with all booleans `false`).
- Exports strongly-typed helpers: `getSettings()`, `saveSettings()`, and `watchSettings()`.

### 3. Content Script Orchestrator (`entrypoints/content.ts`)
Implements `prd.md > Route-Aware Content Hiding`, `prd.md > Instant Reactivity and Caching`.
- Runs at `document_start` on all `*://*.youtube.com/*` pages.
- Maintains in-memory `cachedSettings: TidyTubeSettings`.
- Sets up `browser.storage.onChanged` listener to instantly sync popup toggle updates into `cachedSettings` and trigger dynamic style re-application.
- Observes YouTube SPA navigation hooks: `yt-navigate-finish`, `yt-page-data-updated`, and popstate events.

### 4. Style Injector Engine (`src/utils/style-injector.ts`)
Implements `prd.md > Homepage Decluttering`, `prd.md > Search Results Cleaning`, `prd.md > Watch Page Distraction Elimination`.
- Injects and manages a dedicated `<style id="tidytube-styles">` element in `document.head` or `document.documentElement`.
- Maps active boolean settings to specific CSS rules using YouTube's robust structural selectors:
  - `hideHomeRecommendations`: `ytd-browse[page-subtype="home"] #primary, ytd-browse[page-subtype="home"] ytd-rich-grid-renderer { display: none !important; }`
  - `hideHomeShorts`: `ytd-browse[page-subtype="home"] ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]) { display: none !important; }`
  - `hideSearchShorts`: `grid-shelf-view-model, shorts-lockup-view-model, yt-shorts-lockup-view-model, ytd-reel-shelf-renderer { display: none !important; }`
  - `hideWatchRecommendations`: `ytd-watch-flexy #secondary, ytd-watch-flexy #related { display: none !important; }`
  - `hideWatchComments`: `ytd-watch-flexy #comments, ytd-watch-flexy ytd-comments, ytd-watch-flexy #chat { display: none !important; }`
  - `hideWatchEndScreen`: `.ytp-ce-element, .ytp-endscreen-content { display: none !important; }`
  - `hideWatchInfoCards`: `.ytp-cards-teaser, .ytp-cards-button { display: none !important; }`

### 5. Shorts Redirector (`src/utils/shorts-redirector.ts`)
Implements `prd.md > Shorts Redirection`.
- Checks current URL against `/shorts/:id`.
- When `redirectShorts` is `true`:
  - Parses video ID from `window.location.pathname`.
  - Replaces current URL with `https://www.youtube.com/watch?v=${videoId}` using `window.location.replace()` to prevent back-button redirect loops.

## Data Model

```typescript
export interface TidyTubeSettings {
  // Homepage (Master + Sub-toggles)
  hideHomeRecommendations: boolean;
  hideHomeShorts: boolean;

  // Search
  hideSearchShorts: boolean;

  // Watch page (Master + Sub-toggles)
  hideWatchDistractions: boolean;
  hideWatchRecommendations: boolean;
  hideWatchComments: boolean;
  hideWatchEndScreen: boolean;
  hideWatchInfoCards: boolean;

  // Shorts
  redirectShorts: boolean;
}

export const DEFAULT_SETTINGS: TidyTubeSettings = {
  hideHomeRecommendations: false,
  hideHomeShorts: false,
  hideSearchShorts: false,
  hideWatchDistractions: false,
  hideWatchRecommendations: false,
  hideWatchComments: false,
  hideWatchEndScreen: false,
  hideWatchInfoCards: false,
  redirectShorts: false,
};
```

- **Storage Location:** `browser.storage.local` under key `tidytube_settings`.
- **In-Memory Cache:** `cachedSettings` object kept in the content script execution scope.
- **Lifecycle:** Reads storage on tab load; updates on `browser.storage.onChanged`; persists indefinitely across browser restarts.

## File Structure

```
TidyTube/
├── entrypoints/
│   ├── popup/
│   │   ├── index.html            # Popup mount HTML
│   │   ├── main.tsx              # React DOM render entry
│   │   ├── App.tsx               # Main popup component & state logic
│   │   └── style.css             # Tailwind base and utility directives
│   ├── background.ts             # Background service worker entrypoint
│   └── content.ts                # Content script entrypoint on youtube.com
├── src/
│   ├── components/
│   │   ├── Header.tsx            # Popup title and status
│   │   ├── ToggleGroup.tsx       # Group container for route controls
│   │   └── CheckboxItem.tsx      # Styled checkbox with indentation support
│   ├── types/
│   │   └── settings.ts           # TidyTubeSettings interface and defaults
│   └── utils/
│       ├── storage.ts            # Extension storage read/write/listen helpers
│       ├── style-injector.ts     # Dynamic CSS rule generator and injector
│       └── shorts-redirector.ts  # Client-side /shorts/ to /watch URL rewriter
├── devpost/
│   ├── learner-profile.md        # Learner context and preferences
│   ├── scope.md                  # Approved scope definition
│   ├── prd.md                    # Approved product requirements
│   └── spec.md                   # This approved technical specification
├── package.json                  # Dependencies (wxt, react, tailwindcss, typescript)
├── tsconfig.json                 # TypeScript compiler configuration
├── tailwind.config.js            # Tailwind theme tokens (YouTube dark palette)
└── wxt.config.ts                 # WXT manifest configuration and permissions
```

## External Services and Dependencies

- **Dependencies:**
  - `wxt`: Extension bundling and manifest generation. [Docs](https://wxt.dev)
  - `react` & `react-dom`: Component tree for popup. [Docs](https://react.dev)
  - `tailwindcss` & `postcss` & `autoprefixer`: Styling utilities. [Docs](https://tailwindcss.com)
  - `typescript`: Type checking and interfaces. [Docs](https://www.typescriptlang.org)
- **Permissions Required in `wxt.config.ts`:**
  - `storage`: For reading and saving toggle settings locally.
  - Matches: `*://*.youtube.com/*` for content script execution.
- **External Network Services:** None. Completely offline, zero telemetry, zero external APIs.

## Important Failure Modes

1. **YouTube Changes Class Names or DOM Tree:**
   - *Failure:* If YouTube alters element selectors, elements might briefly stop hiding.
   - *Fallback:* We rely on structural custom-element names (`ytd-comments`, `ytd-rich-grid-renderer`, `ytd-reel-shelf-renderer`, `#related`) rather than obfuscated classes (`.style-scope`), and group selectors with graceful fallback rules.
2. **SPA History Redirect Loop:**
   - *Failure:* Redirecting `/shorts/:id` to `/watch?v=:id` could trap the user if pressing browser Back immediately returns to the Shorts URL.
   - *Fallback:* Use `window.location.replace()` so the Shorts entry is replaced in history rather than appended, allowing normal Back-button navigation.
3. **Extension Context Invalidation on Extension Reload:**
   - *Failure:* If the extension is updated or reloaded in developer mode while YouTube tabs are open, storage listeners can throw context invalidation errors.
   - *Fallback:* Wrap storage event listeners in a safe guard checking `browser.runtime?.id`.

## What Was Simplified and Why

- **Dynamic CSS Injection instead of DOM MutationObserver Removal:** Hiding elements via injected `<style>` tag avoids race conditions and CPU overhead caused by continuous DOM tree mutations. The browser renderer hides elements instantly before paint with zero flicker.
- **Content-Script Navigation Hook instead of Background declarativeNetRequest for Shorts:** Using client-side URL interception in the content script keeps the redirection logic simple, debuggable, and fully aligned with YouTube's in-page SPA routing without needing invasive webRequest permissions.
- **Local Extension Storage instead of Cloud Sync:** Keeping settings in `browser.storage.local` provides instant read/write speeds, works offline, and requires zero auth infrastructure for the proof of concept.

## Decisions and Open Issues

### Decisions Made
- **WXT + React + Tailwind + TypeScript:** Chosen to give the learner a modular, component-based popup UI with familiar tools, clean state management, and rapid YouTube dark theme styling.
- **In-Memory Caching in Content Script:** Selected to resolve the learner's latency concern. Content scripts live across SPA navigation; storing settings in a simple JS object ensures 0ms access without slow storage reads.
- **Master-Child Hierarchy Logic:** Handled cleanly in React state: toggling the master `/watch` switch sets all 4 sub-switches; unchecking any single sub-switch unchecks the master switch while preserving the others.

### Learner Uncertainty Clarified
- **The Question:** *"Where are we going to keep it cached in the background script like just variables etc., so we don't look at slow browser storage every time?"*
- **What Clarified It:** Background service workers in Manifest V3 go to sleep when idle. Because YouTube is an SPA, the **content script** inside the tab stays continuously alive. By caching settings in a content script variable and syncing via `browser.storage.onChanged`, every route transition has instant, in-memory access with zero storage lag and zero background worker wakeup delay.

### Open Questions
- None blocking spec approval. CSS selectors for YouTube elements will be verified against live YouTube DOM during Step 1 of `5-build`.
