import { getSettings, watchSettings } from '../src/utils/storage';
import { StyleInjector } from '../src/utils/style-injector';
import { ShortsRedirector } from '../src/utils/shorts-redirector';
import { PlaylistTimer } from '../src/utils/playlist-timer';
import { DEFAULT_SETTINGS, type TidyTubeSettings } from '../src/types/settings';

export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  runAt: 'document_start',
  main() {
    console.log('[TidyTube] Content script active on YouTube');

    // In-memory cache for instant zero-latency styling & redirection across SPA navigation
    let cachedSettings: TidyTubeSettings = { ...DEFAULT_SETTINGS };

    // Apply active styles, check route redirection, and update playlist timer
    const handleRouteUpdate = () => {
      StyleInjector.update(cachedSettings);
      ShortsRedirector.checkAndRedirect(cachedSettings.redirectShorts);
      PlaylistTimer.update(cachedSettings.showPlaylistDuration);
    };

    // 1. Initial settings load & route check
    getSettings()
      .then((settings) => {
        cachedSettings = settings;
        console.log('[TidyTube] Loaded settings in content script:', cachedSettings);
        handleRouteUpdate();
      })
      .catch((err) => {
        console.error('[TidyTube] Failed to load initial settings:', err);
      });

    // 2. React to popup toggle updates in real-time
    watchSettings((newSettings) => {
      console.log('[TidyTube] Settings updated via popup:', newSettings);
      cachedSettings = newSettings;
      handleRouteUpdate();
    });

    // 3. YouTube SPA lifecycle hooks (dispatched on document and window)
    document.addEventListener('yt-navigate-start', handleRouteUpdate);
    document.addEventListener('yt-navigate-finish', handleRouteUpdate);
    document.addEventListener('yt-page-data-updated', handleRouteUpdate);
    window.addEventListener('yt-navigate-finish', handleRouteUpdate);
    window.addEventListener('yt-page-data-updated', handleRouteUpdate);
    window.addEventListener('popstate', handleRouteUpdate);

    // 4. Fallback URL polling to catch history.pushState SPA transitions with zero lag
    let lastUrl = window.location.href;
    setInterval(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        handleRouteUpdate();
      }
    }, 100);

    // 5. Intercept clicks on /shorts/ links across Shadow DOM to navigate straight to /watch
    ShortsRedirector.interceptClicks(() => cachedSettings.redirectShorts);
  },
});
