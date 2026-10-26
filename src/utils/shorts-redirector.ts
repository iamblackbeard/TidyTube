/**
 * Extracts a Shorts video ID from a pathname or URL, if present.
 * Matches: /shorts/:id or https://www.youtube.com/shorts/:id
 */
export function extractShortsId(urlOrPath: string): string | null {
  try {
    if (!urlOrPath) return null;

    let path = urlOrPath;
    if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
      path = new URL(urlOrPath).pathname;
    } else {
      const withoutQuery = urlOrPath.split('?')[0] ?? '';
      path = withoutQuery.split('#')[0] ?? '';
    }

    const match = path.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
    return match && match[1] ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Determines whether a URL should be redirected to a standard /watch URL.
 * Returns the destination watch URL if redirection is required, or null otherwise.
 */
export function getRedirectUrl(urlOrPath: string, isEnabled: boolean): string | null {
  if (!isEnabled) return null;
  const videoId = extractShortsId(urlOrPath);
  if (!videoId) return null;

  return `/watch?v=${videoId}`;
}

export class ShortsRedirector {
  /**
   * Checks the current browser location and replaces it with standard watch player
   * if currently on a /shorts/ route and the feature is enabled.
   */
  public static checkAndRedirect(isEnabled: boolean): boolean {
    if (!isEnabled || typeof window === 'undefined') return false;

    const currentPath = window.location.pathname;
    const videoId = extractShortsId(currentPath);

    if (videoId) {
      const search = window.location.search;
      const destination = `https://www.youtube.com/watch?v=${videoId}${search ? '&' + search.slice(1) : ''}`;
      console.log(`[TidyTube] Redirecting Shorts ${videoId} -> ${destination}`);
      // Replace location to overwrite history entry
      window.location.replace(destination);
      return true;
    }

    return false;
  }

  /**
   * Intercepts click events on <a> links pointing to /shorts/ to navigate directly
   * to /watch?v= before YouTube's SPA routing mounts the vertical shorts player.
   * Traverses shadow roots using event.composedPath().
   */
  public static interceptClicks(getEnabled: () => boolean): () => void {
    if (typeof document === 'undefined') return () => {};

    const clickHandler = (event: MouseEvent) => {
      if (!getEnabled()) return;

      // Use composedPath to find anchor even inside Shadow DOM
      const path = event.composedPath ? event.composedPath() : [];
      let anchor: HTMLAnchorElement | null = null;

      for (const node of path) {
        if (node instanceof HTMLElement && node.tagName.toLowerCase() === 'a') {
          anchor = node as HTMLAnchorElement;
          break;
        }
      }

      if (!anchor) {
        const target = event.target as HTMLElement | null;
        anchor = target?.closest('a') as HTMLAnchorElement | null;
      }

      if (!anchor) return;

      const href = anchor.getAttribute('href') || anchor.href;
      if (!href) return;

      const videoId = extractShortsId(href);
      if (videoId) {
        console.log(`[TidyTube] Intercepted click on Shorts link ${videoId}, navigating to /watch`);
        event.preventDefault();
        event.stopPropagation();
        window.location.assign(`https://www.youtube.com/watch?v=${videoId}`);
      }
    };

    document.addEventListener('click', clickHandler, true);
    return () => {
      document.removeEventListener('click', clickHandler, true);
    };
  }
}
