---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn

## Slices

- [x] **1. Scaffold WXT extension with semantic theme and verify extension wiring (popup, background, content scripts)**
  Becomes usable: A running browser extension with semantic dark theme styling (`bg-primary`, `text-onPrimary`, `border-border`, `accent-accent`). Opening the popup displays the styled TidyTube header and status, while the background service worker and YouTube content script run and log active lifecycle status.
  Why now: Proves the whole foundation and extension architecture first — WXT project build, manifest generation, semantic theme configuration, popup rendering, background service worker, and content script execution on YouTube — before layering on specific DOM manipulation rules.
  PRD ref: `prd.md > The Core Journey` (steps 1-2), `prd.md > Screens and Layout` (Extension Toolbar Popup), `prd.md > Look and Feel`
  Spec ref: `spec.md > Stack`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Look and Feel`, `spec.md > File Structure`
  Build: Initialize WXT project with React, Tailwind CSS, and TypeScript. Configure `tailwind.config.js` with semantic tokens (`primary`, `onPrimary`, `surface`, `onSurface`, `border`, `accent`). Create `entrypoints/popup/` mounting `App.tsx` and `Header.tsx` styled with semantic theme utility classes (`bg-primary`, `text-onPrimary`, etc.). Create `entrypoints/background.ts` and `entrypoints/content.ts` (matching `*://*.youtube.com/*`) logging initialization to verify cross-boundary extension execution.
  Verify (mechanical): Run `npm run build` to confirm extension builds cleanly with zero errors; inspect generated manifest and bundles in `.output/chrome-mv3`.
  Learner check: Load `.output/chrome-mv3` in `chrome://extensions`. Open the TidyTube toolbar popup to confirm the dark theme styling and title; navigate to `https://www.youtube.com` and open DevTools console to confirm content script initialization log.
  Commit: `feat: scaffold wxt extension with semantic theme and verify popup, background, and content scripts`

- [x] **2. Storage manager and YouTube Homepage decluttering end-to-end**
  Becomes usable: TidyTube settings persist in `browser.storage.local`. Opening the popup reveals Homepage distraction checkboxes ("Hide Homepage recommendations", "Hide Homepage Shorts"); toggling them immediately hides or reveals the feeds on active YouTube tabs with zero reload.
  Why now: Proves the core reactive pipeline (Popup UI -> Local Storage -> In-memory Content Script Cache -> Dynamic CSS injection on YouTube) on the primary landing surface.
  PRD ref: `prd.md > The Core Journey` (steps 3, 4a, 5), `prd.md > Features and Behaviors` (Homepage Decluttering, Instant Reactivity and Caching)
  Spec ref: `spec.md > Components` (1. Popup UI Component Tree, 2. Storage Manager, 3. Content Script Orchestrator, 4. Style Injector Engine), `spec.md > Data Model`
  Build: Implement `src/types/settings.ts` with `TidyTubeSettings` and defaults. Implement `src/utils/storage.ts` with typed helpers. Add `ToggleGroup.tsx` and `CheckboxItem.tsx` to popup. In `entrypoints/content.ts`, maintain in-memory `cachedSettings`, listen to `browser.storage.onChanged`, and inject `<style id="tidytube-styles">` via `src/utils/style-injector.ts` to hide homepage recommendations and Shorts.
  Verify (mechanical): Run `npm run build` to verify clean build; run a node verification script testing storage defaults and style injector CSS generation for homepage settings.
  Learner check: Reload extension, open YouTube homepage, tick "Hide Homepage recommendations" in popup, and verify the video feed vanishes immediately.
  Commit: `feat: implement storage manager and homepage decluttering end-to-end`

- [x] **3. Watch page master and granular distraction elimination**
  Becomes usable: On any YouTube watch page, user can quiet sidebar recommendations, comments, end screens, and info cards all at once or individually via master-child toggle synchronization.
  Why now: Watch page is the primary video consumption surface with hierarchical state (master toggle controlling 4 sub-toggles) and multi-element dynamic styling.
  PRD ref: `prd.md > The Core Journey` (step 4c), `prd.md > Features and Behaviors` (Watch Page Distraction Elimination), `prd.md > Screens and Layout` (Extension Toolbar Popup)
  Spec ref: `spec.md > Components` (1. Popup UI Component Tree, 4. Style Injector Engine), `spec.md > Data Model`, `spec.md > Decisions and Open Issues` (Master-Child Hierarchy Logic)
  Build: Add Watch Page toggle group to popup with master-child toggle synchronization (toggling "Hide Watch Distractions" updates all 4 sub-switches; unchecking any single sub-switch disengages the master switch). Update `src/utils/style-injector.ts` to map watch page booleans to YouTube selectors (`#secondary`, `#related`, `#comments`, `.ytp-ce-element`, `.ytp-cards-button`).
  Verify (mechanical): Run `npm run build` to verify clean build; run a verification script testing master-child state synchronization logic and CSS rule generation for watch page settings.
  Learner check: Reload extension, navigate to any YouTube video watch page, toggle "Hide Watch Distractions" in the popup, and verify comments, recommendations, and end cards are hidden immediately.
  Commit: `feat: add watch page master and granular distraction toggles`

- [ ] **4. Search results decluttering and Shorts redirection**
  Becomes usable: YouTube search results display cleanly without Shorts shelves, and clicking or navigating directly to any `/shorts/:id` link automatically redirects into the calm `/watch?v=:id` player.
  Why now: Completes the full core journey across all targeted YouTube surfaces by handling the remaining route selectors and hooking into YouTube's single-page app navigation lifecycle for URL rewriting.
  PRD ref: `prd.md > The Core Journey` (step 4b, 4d), `prd.md > Features and Behaviors` (Search Results Cleaning, Shorts Redirection)
  Spec ref: `spec.md > Components` (3. Content Script Orchestrator, 4. Style Injector Engine, 5. Shorts Redirector), `spec.md > Important Failure Modes` (SPA History Redirect Loop)
  Build: Add Search Shorts toggle in popup and selectors in `src/utils/style-injector.ts` (`ytd-search ytd-reel-shelf-renderer`, `ytd-search ytd-shelf-renderer:has([href*="/shorts"])`). Implement `src/utils/shorts-redirector.ts` using `window.location.replace` to redirect `/shorts/:id` to `/watch?v=:id`. Wire `redirectShorts` into `entrypoints/content.ts` with YouTube SPA navigation hooks (`yt-navigate-finish`, popstate).
  Verify (mechanical): Run `npm run build` to verify clean build; run a verification script testing URL parsing and redirection logic for various `/shorts/` URL formats.
  Learner check: Reload extension, perform a YouTube search to verify no Shorts reels appear, and click/open a Shorts link to verify it automatically plays in the standard `/watch?v=` player.
  Commit: `feat: add search shorts cleaning and shorts redirection`

## Hands-on Checkpoints

- [x] Early usable behavior explored — Slice 1 (Scaffold, semantic theme, popup, background, and content script execution)
- [ ] Final kick-the-tires exploration and feedback completed — Slice 4 (Full extension end-to-end across all surfaces)

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: [what actually happened; real document/test/code references; unfinished work if interrupted]
Route and stops: [actual paths and symbols; guided stops completed, or reference-only route]
Edit outcome: [tried/kept/reverted/declined/not applicable; verification if changed]
Reflection: [offered/answered/declined/already covered — personal answer belongs only in the ignored profile]
Activity mode: [live app and editor, explicit static fallback, focused alternative, prior practice, or recap]

## Revisions
