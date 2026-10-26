import { getSettings, watchSettings } from '../src/utils/storage';
import { StyleInjector } from '../src/utils/style-injector';
import { DEFAULT_SETTINGS, type TidyTubeSettings } from '../src/types/settings';

export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  runAt: 'document_start',
  main() {
    console.log('[TidyTube] Content script active on YouTube');

    // In-memory cache for instant zero-latency styling across SPA navigation
    let cachedSettings: TidyTubeSettings = { ...DEFAULT_SETTINGS };

    // Apply active styles to the page
    const applyStyles = () => {
      StyleInjector.update(cachedSettings);
    };

    // 1. Initial settings load
    getSettings()
      .then((settings) => {
        cachedSettings = settings;
        applyStyles();
      })
      .catch((err) => {
        console.error('[TidyTube] Failed to load initial settings:', err);
      });

    // 2. React to popup toggle updates in real-time
    watchSettings((newSettings) => {
      cachedSettings = newSettings;
      applyStyles();
    });

    // 3. Keep styles active across YouTube's client-side SPA navigation
    window.addEventListener('yt-navigate-finish', applyStyles);
    window.addEventListener('yt-page-data-updated', applyStyles);
    window.addEventListener('popstate', applyStyles);
  },
});
