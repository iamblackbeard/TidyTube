---
doc: feature-spec
title: YouTube Playlist Total Duration
status: approved
---

# Feature Specification: YouTube Playlist Total Duration

Calculates and displays the cumulative runtime of all videos in a YouTube playlist directly within the `/playlist` route's sidebar metadata panel.

---

## 1. Feature Overview & Placement

* **Target Surface:** YouTube playlist page (`/playlist?list=...`).
* **Placement Location:** In the left sidebar metadata block, directly below the video count and view count (e.g., beneath `15 videos • 12,345 views`).
* **Visual Style:** 
  * A native-feeling clock icon (SVG).
  * Formatted total duration text matching YouTube's ambient secondary typography tokens and colors.
  * Seamless layout that adjusts to light/dark themes without visual flickering or layout shifts.

---

## 2. Display Format & Time Breakdown

* **Formatting Rule:** Clean, human-readable format:
  * `>= 1 hour`: `Xh Ym` (e.g., `10h 24m` or `10h` if minutes are zero).
  * `< 1 hour`: `Xm Ys` (e.g., `45m 12s`).
* **Clarity:** Compact and legible at a glance without cluttering the sidebar.

---

## 3. Edge Cases & Special Handling

* **YouTube Mix & Continuous Playlists (`list=RD...`):**
  * Auto-generated mixes and continuous radio streams do not have a fixed end.
  * Handled gracefully by displaying an infinity symbol `∞` with the clock/infinity icon instead of a misleading partial count.
* **Unavailable, Private, or Deleted Videos:**
  * Items without visible duration badges (e.g., `[Private video]`, `[Deleted video]`) are silently skipped from the calculation.
* **Live Streams:**
  * Active live streams without fixed durations are skipped.

---

## 4. Performance & Dynamic Scrolling Architecture

* **Lazy-Load Handling:**
  * YouTube only renders the initial batch of videos (~100 items) and loads subsequent batches on scroll.
  * The total duration dynamically updates as new video items are appended to the DOM.
* **Zero-Lag Architecture:**
  * **300ms Debounce:** Batching DOM mutation and scroll events to avoid frequent recalculations.
  * **Video ID Duration Cache (`Map<string, number>`):** Caches parsed durations per video ID so existing elements are never re-parsed when scrolling. Only new batches are processed in $O(\Delta N)$ time.
* **Lifecycle & SPA Navigation:**
  * Automatically initializes when navigating to a `/playlist` route.
  * Observers, listeners, and injected elements are cleanly dismantled when navigating away (e.g., to `/watch` or `/`).

---

## 5. Extension Settings & Real-Time Sync

* **Popup Toggle:**
  * Added under a dedicated **Playlist** section in the TidyTube toolbar popup.
  * Setting: `"Show playlist total duration"` (`showPlaylistDuration`).
  * Default state: `true` (enabled).
* **Live Reactivity:**
  * Toggling off in the popup instantly removes the injected duration element from active YouTube tabs.
  * Toggling on immediately computes and renders the duration badge with zero page reload required.
