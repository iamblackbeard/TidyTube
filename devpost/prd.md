---
doc: prd
status: approved
---

# TidyTube — Product Requirements

A cross-browser extension for Chromium and Firefox that eliminates algorithmic rabbit holes on YouTube, redirects vertical Shorts to standard video players, and gives users instant focus control through a clean toolbar popup.
Source: `scope.md > The Unique Kernel`, `scope.md > The POC Boundary`

## The Core Journey

1. **Installation & First Open:** The user installs the TidyTube extension. By default, all toggles are unchecked, leaving YouTube untouched until the user chooses what to quiet.
2. **Customizing Focus:** The user clicks the TidyTube extension icon in the browser toolbar. A compact, YouTube-native dark popup opens displaying focus controls grouped by YouTube route.
3. **Instant Application:** The user checks their preferred distractions to hide (e.g., hiding Homepage recommendations, search Shorts, or watch distractions). The open YouTube tab updates immediately in real time without a manual page refresh.
4. **Navigating YouTube:**
   - **Homepage:** If home recommendations are hidden, the user sees a calm, distraction-free space under the top search bar instead of an infinite video feed.
   - **Search:** The user searches for a tutorial or topic. Results display cleanly with no Shorts shelves or reels.
   - **Watch Page:** While watching a video, the sidebar recommendations, comments, end-screen recommendation cards, and player info cards are hidden per the user's settings.
   - **Shorts Links:** If the user clicks or pastes a `/shorts/:id` link, TidyTube immediately routes it to play inside the standard `/watch?v=:id` player.
5. **Persistence & Performance:** The user's toggle choices are saved locally. Whenever they navigate between YouTube pages or reopen the browser, their settings apply instantly with zero lag and no visual flicker.

Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`

## Screens and Layout

### 1. Extension Toolbar Popup
A clean, compact popup window accessible from the browser toolbar:
- **Header:** "TidyTube" title with subtle focus status.
- **Controls List:**
  - `Hide Homepage recommendation`
    - `Hide shorts` (nested sub-toggle)
  - `Hide shorts in search`
  - `Hide /watch distraction` (master toggle — checking this automatically checks all 4 sub-toggles below)
    - `Hide recommendation` (watch sidebar / below-player recommendations)
    - `Hide comment` (comments section and live chat stream)
    - `Hide end of video recommendation` (cards/tiles that pop up over the video near the end)
    - `Hide I card in the player` (info card teasers in the top-right of the video player)
  - `Redirect shorts` (instant reroute of `/shorts/*` to `/watch?v=*`)

### 2. YouTube Surfaces Affected
- **Homepage (`/`):** When feed is hidden, the main video grid is removed, leaving a clean, neutral area below the YouTube header and search bar.
- **Search Results (`/search`):** Search result stream with all Shorts shelves and reels removed.
- **Watch Page (`/watch`):** Clean player view with selected distraction elements (sidebar, comments, live chat, end-screen cards, info cards) removed.
- **Shorts (`/shorts/*`):** Seamless redirection target converting vertical player URLs to the standard watch interface.

## Look and Feel
- **Theme:** YouTube-native dark theme starting out (deep dark background `#0f0f0f` / `#181818`, clean subtle borders `#272727`).
- **Typography:** Clean, sans-serif typography matching YouTube's native UI feel (Roboto / system sans-serif).
- **Accents:** YouTube Red (`#FF0000` / `#CC0000`) for active checkboxes and toggle highlights.
- **Tone:** Subtle, minimal, and non-intrusive. The popup feels like a native utility rather than a third-party overlay.

## Features and Behavior

### Route-Aware Content Hiding
Source: `scope.md > The POC Boundary`

#### Homepage Decluttering
- As an intentional learner, I want to hide the homepage algorithmic feed and Shorts so that I am not tempted by recommendations when opening YouTube.
  - [ ] Checking `Hide Homepage recommendation` hides the homepage video recommendations grid, leaving a clean area below the search bar.
  - [ ] Checking `Hide shorts` hides the Shorts shelf on the homepage.
  - [ ] Unchecking restores the feed/Shorts without requiring a reload.

#### Search Results Cleaning
- As a student searching for specific lectures, I want Shorts removed from search results so that quick-hit entertainment doesn't distract from my search query.
  - [ ] Checking `Hide shorts in search` hides all Shorts shelves, sections, and vertical reel cards from search results.
  - [ ] Standard video results remain intact and properly laid out.

#### Watch Page Distraction Elimination
- As a viewer watching a long video, I want to eliminate sidebar recommendations, comments, end cards, and player info cards so that I can focus entirely on the video content.
  - [ ] Checking `Hide /watch distraction` enables all sub-toggles (`Hide recommendation`, `Hide comment`, `Hide end of video recommendation`, `Hide I card in the player`).
  - [ ] Unchecking any single sub-toggle keeps remaining sub-toggles active and unchecks the master `/watch distraction` checkbox.
  - [ ] `Hide recommendation` hides the related video sidebar and below-player suggestions.
  - [ ] `Hide comment` hides the comments section and live chat.
  - [ ] `Hide end of video recommendation` hides end-screen video suggestion overlays.
  - [ ] `Hide I card in the player` hides info card teasers and drawer icons inside the player.

### Shorts Redirection
Source: `scope.md > The Core Loop`

- As a user following a link to a video published as a Short, I want it to load in the standard watch player so that I get standard playback controls (scrubbing, playback speed, normal layout) instead of infinite-scroll feeds.
  - [ ] When `Redirect shorts` is enabled, any navigation to `youtube.com/shorts/:id` immediately redirects to `youtube.com/watch?v=:id`.
  - [ ] Redirection happens client-side without jarring back-button loops.

### Instant Reactivity and Caching
- As a frequent YouTube user, I want my toggle changes to apply immediately and page transitions to feel instantaneous so that there is no visual flicker or delay while navigating.
  - [ ] Clicking any toggle in the popup applies the change instantly to any active YouTube tabs.
  - [ ] User settings are cached in-memory during browsing so YouTube SPA transitions (clicking videos, back button) apply the hiding rules immediately without noticeable flicker or slow storage lookups.

## States and Boundaries

- **First Use:** All checkboxes are unchecked upon initial installation. The extension does not alter YouTube until the user chooses what to hide.
- **Normal Use:** The extension runs quietly, applying the user's active choices across all open and newly opened YouTube tabs.
- **Empty State (Homepage):** When home recommendations are hidden, the area below the header remains clean and unobstructed.
- **SPA Page Transitions:** YouTube single-page navigation is handled smoothly; hiding rules apply continuously as new pages load.
- **Persistence:** All toggle states are stored in browser local extension storage and persist across browser restarts.
- **Boundaries:** Runs strictly on `youtube.com` domains; no external network requests, no account creation, no analytics tracking.

## Product Decisions

- **Unchecked by Default:** The extension starts with all toggles disabled so users consciously pick what to silence and can immediately verify that each toggle works as expected.
- **Master & Granular Watch Controls:** Grouping watch distractions under a master `/watch` toggle gives users the option for a 1-click total focus mode while still allowing granular control (e.g. keeping comments visible while hiding recommendations).
- **Client-Side Shorts Rerouting:** Rather than blocking Shorts entirely, TidyTube redirects them into regular `/watch?v=` URLs, preserving the ability to watch the content while stripping the vertical scrolling trap.
- **Flicker-Free Speed Requirement:** Navigating YouTube must not flash hidden elements before removing them; fast in-memory access is treated as a core product requirement.

## What We're Building

- Cross-browser extension (Chromium and Firefox) using WXT and TypeScript.
- Extension popup UI with dark theme, YouTube Red accents, and hierarchical checkboxes.
- Content script logic handling:
  - Homepage feed and Shorts hiding.
  - Search results Shorts hiding.
  - Watch page recommendations, comments, live chat, end-screen cards, and player info cards hiding.
  - Shorts URL redirect to standard watch player.
- Real-time tab messaging and local storage persistence.

## Deferred From the POC
Source: `scope.md > Later`

- **Playlist Total Duration Calculator:** Scanning playlist pages to sum and display the combined run-time for lecture series (deferred to keep initial POC clean and fast).
- **Full-Width Player Mode:** Expanding the video player to fill the full viewport width (deferred to avoid layout conflicts with YouTube player changes).
- **Keyboard Shortcuts:** Hotkeys to toggle features on the fly.

## Possible Later Enhancements
- Whitelisting specific channels for comments or recommendations.
- Quick preset modes (e.g., "Deep Study Mode" vs "Casual Mode").

## Non-Goals
Source: `scope.md > Explicitly Cut`

- **Video Ad-Blocking:** YouTube actively detects and breaks ad-blockers; TidyTube strictly focuses on UX distraction elimination and intentional viewing.
- **Cloud Settings Sync:** Local storage is instant, offline-capable, and private; cloud account sync adds unnecessary complexity for a POC.
- **Custom Theme Engine:** The popup sticks to a native YouTube dark look rather than a complex theme customizer.

## Open Questions

- *Implementation details of in-memory caching vs background worker*: The user identified the need for zero-latency cached settings across SPA routes. This is a technical design detail and will be specified in `4-spec`.
