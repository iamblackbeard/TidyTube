/**
 * Parses timestamp string (e.g., "10:24", "1:15:30", "01:02:15:30") into total seconds.
 * Returns null for invalid strings, live streams, or private videos.
 */
export function parseTimestampToSeconds(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === 'LIVE' || trimmed.includes('SHORTS')) return null;

  // Extract clean colon-separated timestamp pattern (e.g., "12:34" or "1:02:34")
  const match = trimmed.match(/\b(?:\d{1,2}:){1,3}\d{2}\b/);
  if (!match || !match[0]) return null;

  const parts = match[0].split(':').map((p) => p.trim());
  if (parts.length < 2 || parts.length > 4) return null;

  const nums = parts.map(Number);
  if (nums.some((n) => isNaN(n) || n < 0)) return null;

  const multipliers = [1, 60, 3600, 86400];
  let total = 0;
  for (let i = 0; i < nums.length; i++) {
    const val = nums[nums.length - 1 - i];
    const mult = multipliers[i];
    if (val === undefined || mult === undefined) return null;
    total += val * mult;
  }
  return total;
}

/**
 * Formats total seconds into a clean human-readable duration:
 * - >= 1 hour: "Xh Ym" (or "Xh" if minutes = 0)
 * - < 1 hour: "Xm Ys" (or "Xm" if seconds = 0)
 */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0s';
  const hours = Math.floor(totalSeconds / 3600);
  const remainingSeconds = totalSeconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }
  return `${seconds}s`;
}

/**
 * Checks if the current URL points to a continuous/infinite YouTube Mix (e.g., list=RD...)
 */
export function isMixPlaylist(searchParams: string): boolean {
  try {
    const params = new URLSearchParams(searchParams);
    const list = params.get('list');
    return Boolean(list && (list.startsWith('RD') || list.startsWith('UL')));
  } catch {
    return false;
  }
}

/**
 * PlaylistTimer singleton manages calculating and injecting the total playlist duration.
 */
export class PlaylistTimer {
  private static durationCache = new Map<string, number>();
  private static currentListId: string | null = null;
  private static lastRenderedText: string | null = null;
  private static observer: MutationObserver | null = null;
  private static debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private static retryTimer: ReturnType<typeof setTimeout> | null = null;
  private static retryCount = 0;
  private static readonly MAX_RETRIES = 5;
  private static readonly ELEMENT_ID = 'tidytube-playlist-duration';

  private static findBadge(): HTMLElement | null {
    const badges = Array.from(document.querySelectorAll<HTMLElement>(`#${this.ELEMENT_ID}, .tidytube-playlist-duration-badge`));
    if (badges.length > 0) {
      const [first, ...rest] = badges;
      for (const extra of rest) {
        extra.remove();
      }
      if (first) return first;
    }
    const header = document.querySelector('ytd-playlist-header-renderer, yt-page-header-renderer');
    if (header && (header as HTMLElement).shadowRoot) {
      return ((header as HTMLElement).shadowRoot?.querySelector('#' + this.ELEMENT_ID) as HTMLElement) || null;
    }
    return null;
  }

  private static findInsertionTarget(): { element: Element; position: 'afterend' | 'beforebegin' | 'append' } | null {
    // 1. Primary target: ytd-playlist-byline-renderer or .metadata-stats (just below video count and last update date)
    const byline =
      document.querySelector('ytd-playlist-header-renderer ytd-playlist-byline-renderer') ||
      document.querySelector('ytd-playlist-byline-renderer') ||
      document.querySelector('ytd-playlist-header-renderer .metadata-stats') ||
      document.querySelector('.metadata-stats') ||
      document.querySelector('ytd-playlist-header-renderer #stats') ||
      document.querySelector('#stats');

    if (byline) {
      return { element: byline, position: 'afterend' };
    }

    // 2. Action buttons target: bookmark and share icon container (insert just above them)
    const actionButtons =
      document.querySelector('ytd-playlist-header-renderer #top-level-buttons-computed') ||
      document.querySelector('ytd-playlist-header-renderer ytd-menu-renderer') ||
      document.querySelector('ytd-playlist-header-renderer #actions') ||
      document.querySelector('ytd-playlist-header-renderer .action-buttons') ||
      document.querySelector('#top-level-buttons-computed') ||
      document.querySelector('.page-header-view-model-wiz__page-header-actions');

    if (actionButtons && actionButtons.parentElement) {
      return { element: actionButtons, position: 'beforebegin' };
    }

    // 3. Metadata text wrapper target: append inside after the last metadata text item
    const metadataWrapper =
      document.querySelector('ytd-playlist-header-renderer .metadata-text-wrapper') ||
      document.querySelector('.metadata-text-wrapper') ||
      document.querySelector('ytd-playlist-header-renderer .metadata-wrapper') ||
      document.querySelector('.metadata-wrapper');

    if (metadataWrapper) {
      return { element: metadataWrapper, position: 'append' };
    }

    // 4. Shadow DOM fallback if custom element uses shadow root
    const header = document.querySelector('ytd-playlist-header-renderer, yt-page-header-renderer');
    if (header && (header as HTMLElement).shadowRoot) {
      const shadow = (header as HTMLElement).shadowRoot!;
      const shadowByline =
        shadow.querySelector('ytd-playlist-byline-renderer') ||
        shadow.querySelector('.metadata-stats') ||
        shadow.querySelector('#stats');
      if (shadowByline) {
        return { element: shadowByline, position: 'afterend' };
      }

      const shadowActions =
        shadow.querySelector('#top-level-buttons-computed') ||
        shadow.querySelector('ytd-menu-renderer') ||
        shadow.querySelector('#actions');
      if (shadowActions && shadowActions.parentElement) {
        return { element: shadowActions, position: 'beforebegin' };
      }

      const shadowWrapper =
        shadow.querySelector('.metadata-text-wrapper') ||
        shadow.querySelector('.metadata-wrapper');
      if (shadowWrapper) {
        return { element: shadowWrapper, position: 'append' };
      }
    }

    return null;
  }

  private static isBadgeInCorrectPosition(badge: HTMLElement | null): boolean {
    if (!badge || !badge.isConnected) return false;
    const target = this.findInsertionTarget();
    if (!target) return false;

    if (target.position === 'afterend') {
      return target.element.nextElementSibling === badge;
    }
    if (target.position === 'beforebegin') {
      return target.element.previousElementSibling === badge;
    }
    if (target.position === 'append') {
      return target.element.lastElementChild === badge;
    }
    return false;
  }

  /**
   * Main entrypoint called on route change or settings update.
   */
  public static update(enabled: boolean): void {
    if (!enabled || !this.isPlaylistRoute()) {
      this.cleanup();
      return;
    }

    const listId = this.getListId();
    if (listId !== this.currentListId) {
      console.log(`[TidyTube Playlist] Playlist changed from '${this.currentListId}' to '${listId}'.`);
      this.currentListId = listId;
      this.durationCache.clear();
      this.lastRenderedText = null;
      this.retryCount = 0;
      const existing = this.findBadge();
      if (existing) existing.remove();
    }

    // Schedule immediate calculation and attach observer
    this.scheduleCalculation(50);
    this.setupObserver();
  }

  /**
   * Cleans up observers, timers, and injected DOM elements.
   */
  public static cleanup(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    this.retryCount = 0;
    this.lastRenderedText = null;
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.durationCache.clear();
    this.currentListId = null;

    const badges = document.querySelectorAll(`#${this.ELEMENT_ID}, .tidytube-playlist-duration-badge`);
    badges.forEach((b) => b.remove());
    console.log('[TidyTube Playlist] Removed playlist duration badge.');
  }

  private static scheduleRetry(callback: () => void, reason: string): void {
    if (this.retryCount >= this.MAX_RETRIES) {
      console.warn(`[TidyTube Playlist] Stopped retrying: reached maximum limit of ${this.MAX_RETRIES} attempts. (${reason})`);
      return;
    }
    if (!this.retryTimer) {
      this.retryCount++;
      console.log(`[TidyTube Playlist] Retry ${this.retryCount}/${this.MAX_RETRIES} in 500ms: ${reason}`);
      this.retryTimer = setTimeout(() => {
        this.retryTimer = null;
        callback();
      }, 500);
    }
  }

  private static isPlaylistRoute(): boolean {
    return (
      window.location.pathname === '/playlist' &&
      window.location.search.includes('list=')
    );
  }

  private static getListId(): string | null {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('list');
    } catch {
      return null;
    }
  }

  private static setupObserver(): void {
    if (this.observer) return;

    this.observer = new MutationObserver(() => {
      this.scheduleCalculation(300);
    });

    const target =
      document.querySelector('ytd-playlist-video-list-renderer') ||
      document.querySelector('ytd-browse[page-subtype="playlist"]') ||
      document.body ||
      document.documentElement;

    if (target) {
      this.observer.observe(target, { childList: true, subtree: true });
      console.log(`[TidyTube Playlist] MutationObserver attached to <${target.tagName.toLowerCase()}>`);
    }
  }

  private static scheduleCalculation(delayMs: number): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      this.calculateAndRender();
    }, delayMs);
  }

  private static calculateAndRender(): void {
    if (!this.isPlaylistRoute()) return;

    // 1. Check for continuous / infinite YouTube Mix
    if (isMixPlaylist(window.location.search)) {
      console.log('[TidyTube Playlist] Detected YouTube Mix playlist.');
      this.renderBadge('∞ (Infinite Mix)');
      return;
    }

    // 2. Find all playlist video renderer elements
    const videoSelector =
      'ytd-playlist-video-renderer, yt-lockup-view-model, ytd-playlist-video-list-renderer ytd-item-section-renderer, #contents > ytd-playlist-video-renderer';
    const videoItems = document.querySelectorAll(videoSelector);

    console.log(`[TidyTube Playlist] Queried videos with selector "${videoSelector}": found ${videoItems.length} elements.`);

    if (videoItems.length === 0) {
      this.scheduleRetry(() => this.calculateAndRender(), '0 video items found');
      return;
    }

    // 3. Scan and cache video durations
    let newlyParsed = 0;
    const samples: string[] = [];

    videoItems.forEach((item, index) => {
      const link = item.querySelector('a#video-title, a#thumbnail, a[href*="/watch?v="], a.ytd-playlist-video-renderer') as HTMLAnchorElement | null;
      let videoId = '';
      if (link && link.href) {
        try {
          const url = new URL(link.href, window.location.origin);
          videoId = url.searchParams.get('v') || '';
        } catch {
          videoId = '';
        }
      }
      const cacheKey = videoId || `idx_${index}`;

      if (this.durationCache.has(cacheKey)) {
        return;
      }

      // Query duration badge inside item (supports legacy overlays and modern Lit badge-shape)
      const badgeElem = item.querySelector(
        'badge-shape, yt-badge-shape, .badge-shape-wiz__text, .yt-badge-shape__text, ytd-thumbnail-overlay-time-status-renderer span#text, ytd-thumbnail-overlay-time-status-renderer, #time-status span, #time-status, span[class*="time-status"]'
      );

      const rawTime = (badgeElem as HTMLElement)?.innerText || badgeElem?.textContent || null;
      const seconds = parseTimestampToSeconds(rawTime);

      if (seconds !== null && seconds > 0) {
        this.durationCache.set(cacheKey, seconds);
        newlyParsed++;
        if (samples.length < 3) {
          samples.push(`Video [${cacheKey}]: "${rawTime?.trim()}" -> ${seconds}s`);
        }
      }
    });

    // If badge already exists, is in correct position, and no new videos were found in this pass, stop immediately
    const existingBadge = this.findBadge();
    const isPositionCorrect = this.isBadgeInCorrectPosition(existingBadge);
    if (existingBadge && isPositionCorrect && newlyParsed === 0) {
      return;
    }

    if (newlyParsed > 0) {
      console.log(`[TidyTube Playlist] Parsed ${newlyParsed} new video durations. Total cached: ${this.durationCache.size}`);
    }

    // 4. Calculate total seconds
    let totalSeconds = 0;
    for (const sec of this.durationCache.values()) {
      totalSeconds += sec;
    }

    if (totalSeconds > 0) {
      const formatted = formatDuration(totalSeconds);
      this.renderBadge(formatted);
    }
  }

  private static renderBadge(displayText: string): void {
    const existingBadge = this.findBadge();
    const isPositionCorrect = this.isBadgeInCorrectPosition(existingBadge);

    // If the badge is already rendered with this exact text in the correct position, skip
    if (this.lastRenderedText === displayText && existingBadge && isPositionCorrect) {
      return;
    }

    // Locate the insertion target (just below video count/last updated, just above bookmark & share)
    const target = this.findInsertionTarget();
    if (!target) {
      console.warn('[TidyTube Playlist] Target anchor for duration badge not found yet.');
      this.scheduleRetry(() => this.calculateAndRender(), 'Anchor element not found');
      return;
    }

    console.log(`[TidyTube Playlist] Found target anchor: <${target.element.tagName.toLowerCase()}> with position "${target.position}"`);

    let badge = existingBadge;

    if (!badge) {
      badge = document.createElement('div');
      badge.id = this.ELEMENT_ID;
      badge.className = 'tidytube-playlist-duration-badge style-scope ytd-playlist-header-renderer';
      badge.setAttribute('title', 'Total Playlist Duration (TidyTube)');
      badge.setAttribute(
        'style',
        'display: inline-flex; align-items: center; width: 100%; margin-top: 6px; margin-bottom: 8px; font-size: 12px; font-weight: 500; color: var(--yt-spec-text-secondary, #aaa); line-height: 1.4; user-select: none;'
      );

      // SVG Clock Icon
      const iconSpan = document.createElement('span');
      iconSpan.setAttribute(
        'style',
        'display: inline-flex; align-items: center; margin-right: 6px; color: var(--yt-spec-text-secondary, #aaa); flex-shrink: 0;'
      );
      iconSpan.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      `;

      const textSpan = document.createElement('span');
      textSpan.className = 'tidytube-duration-text';
      textSpan.setAttribute('style', 'display: inline-block; white-space: nowrap;');

      badge.appendChild(iconSpan);
      badge.appendChild(textSpan);
    }

    // Ensure badge is placed at the exact target location
    if (target.position === 'afterend') {
      if (target.element.nextElementSibling !== badge) {
        target.element.insertAdjacentElement('afterend', badge);
        console.log(`[TidyTube Playlist] Positioned duration badge after <${target.element.tagName.toLowerCase()}>`);
      }
    } else if (target.position === 'beforebegin') {
      if (target.element.previousElementSibling !== badge) {
        target.element.insertAdjacentElement('beforebegin', badge);
        console.log(`[TidyTube Playlist] Positioned duration badge before <${target.element.tagName.toLowerCase()}>`);
      }
    } else if (target.position === 'append') {
      if (target.element.lastElementChild !== badge) {
        target.element.appendChild(badge);
        console.log(`[TidyTube Playlist] Appended duration badge to <${target.element.tagName.toLowerCase()}>`);
      }
    }

    const textSpan = badge.querySelector('.tidytube-duration-text');
    if (textSpan && textSpan.textContent !== displayText) {
      textSpan.textContent = displayText;
      console.log(`[TidyTube Playlist] Updated badge text to: "${displayText}"`);
    }

    this.lastRenderedText = displayText;
    this.retryCount = 0;
  }
}
