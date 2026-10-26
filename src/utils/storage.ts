import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY, type TidyTubeSettings } from '../types/settings';

/**
 * Reads all TidyTube settings from local extension storage with defaults fallback.
 */
export async function getSettings(): Promise<TidyTubeSettings> {
  try {
    if (typeof browser === 'undefined' || !browser.storage?.local) {
      return DEFAULT_SETTINGS;
    }
    const data = await browser.storage.local.get(SETTINGS_STORAGE_KEY);
    const stored = data[SETTINGS_STORAGE_KEY] as Partial<TidyTubeSettings> | undefined;
    return {
      ...DEFAULT_SETTINGS,
      ...(stored || {}),
    };
  } catch (error) {
    console.error('[TidyTube] Error reading settings from storage:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Persists updated settings into local extension storage.
 */
export async function saveSettings(partial: Partial<TidyTubeSettings>): Promise<TidyTubeSettings> {
  try {
    const current = await getSettings();
    const updated: TidyTubeSettings = {
      ...current,
      ...partial,
    };
    if (typeof browser !== 'undefined' && browser.storage?.local) {
      await browser.storage.local.set({ [SETTINGS_STORAGE_KEY]: updated });
    }
    return updated;
  } catch (error) {
    console.error('[TidyTube] Error saving settings to storage:', error);
    throw error;
  }
}

/**
 * Subscribes to storage changes, firing callback whenever settings are updated in any context.
 */
export function watchSettings(callback: (newSettings: TidyTubeSettings) => void): () => void {
  if (typeof browser === 'undefined' || !browser.storage?.onChanged) {
    return () => {};
  }

  const listener = (changes: Record<string, { newValue?: unknown; oldValue?: unknown }>, areaName: string) => {
    if (areaName === 'local' && changes[SETTINGS_STORAGE_KEY]) {
      const newValue = changes[SETTINGS_STORAGE_KEY].newValue as Partial<TidyTubeSettings> | undefined;
      callback({
        ...DEFAULT_SETTINGS,
        ...(newValue || {}),
      });
    }
  };

  browser.storage.onChanged.addListener(listener);
  return () => {
    try {
      browser.storage.onChanged.removeListener(listener);
    } catch {
      // Ignore cleanup error if runtime context was already invalidated
    }
  };
}
