---
doc: scope
status: approved
---

# TidyTube

A cross-browser extension (Chromium and Firefox) built with WXT and TypeScript that strips addictive algorithmic distractions from YouTube, redirects Shorts into standard video players, and puts users back in control via popup toggles.

## The Unique Kernel
Comprehensive distraction elimination tailored per YouTube route: silencing algorithmic traps (Shorts feeds, sidebar/home recommendations, comments, live chat) and automatically rerouting `/shorts/:id` into the calm `/watch?v=:id` player, with granular toggle controls from the browser toolbar.

## Who It's For
Students, programmers, and intentional learners who use YouTube for lectures, study, and deep work, but frequently get derailed by algorithmic rabbit holes, recommended video sidebars, and infinite-scroll Shorts. Today, they either rely on willpower or heavy ad-blockers that break page layouts.

## The Core Loop
The user opens YouTube to watch a specific tutorial or lecture. TidyTube operates quietly in the background: no homepage algorithmic feed pulling their attention, no Shorts in search results, no comment debates, and no recommended sidebar on the watch page. If they follow a Shorts link, it smoothly loads in the standard video player instead of the vertical trap. The user clicks the TidyTube extension icon in the toolbar whenever they want to selectively toggle a section back on.

## Inspiration & Identity
- Clean, minimal, non-intrusive.
- Feels native to YouTube’s dark and light aesthetic without jarring layout shifts or flickers.
- Fast and lightweight: instant CSS/DOM updates without lag.

## Why This Matters to the Learner
The learner wants to build a tool that solves their own focus challenges on YouTube while mastering how to decompose a multi-surface project into small, manageable parts so adding features is straightforward and never overwhelming.

## What "Working" Looks Like
In a 60-second screen recording:
1. The user opens `youtube.com`: the homepage feed is clean and free of algorithmic distractions/Shorts.
2. The user searches for a programming topic: search results display without Shorts shelves.
3. The user opens a video: the watch page displays only the video and channel details—recommendation sidebar, comments, and live chat are hidden.
4. The user navigates to a `/shorts/...` link: it automatically redirects and plays as a regular `/watch?v=...` video.
5. The user opens the extension popup, toggles comments back ON, and the comments reappear on the page immediately.

## The POC Boundary
- **Stack:** WXT browser extension framework with TypeScript.
- **Browser Compatibility:** Chromium (Chrome, Brave, Edge) and Firefox.
- **Route-Aware Hiding & Controls (Toggleable via popup):**
  - **Homepage (`/`):** Hide Shorts shelf; option to hide entire homepage feed.
  - **Search (`/search`):** Hide Shorts shelves and reels.
  - **Watch (`/watch`):** Hide recommendations sidebar, comments section, and live chat.
  - **Shorts (`/shorts/*`):** Automatic client-side redirect to standard `/watch?v=*` player.
- **Popup UI:** Clean popup menu with checkboxes to toggle each setting, saved persistently via extension storage.

## Later
- **Playlist Duration Calculator:** Scanning playlist pages to sum and display the combined total run-time for lecture series.
- **Full-Width Player Mode:** Custom CSS/DOM manipulation to expand the video player to fill the full viewport width.
- **Keyboard shortcuts:** Quick-toggle hotkeys (e.g. toggle comments with a keystroke).

## Explicitly Cut
- **Cloud sync of preferences:** Unneeded overhead for a POC; local extension storage is reliable and instant.
- **Complex UI theme builders:** The popup uses a clean, native aesthetic rather than heavy custom theming libraries.
- **Video ad-blocking:** Out of scope and constantly combated by YouTube; our focus is purely UX decluttering and focus.
