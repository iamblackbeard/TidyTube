import { useEffect, useState } from 'react';
import { Header } from '../../src/components/Header';
import { ToggleGroup } from '../../src/components/ToggleGroup';
import { CheckboxItem } from '../../src/components/CheckboxItem';
import { DEFAULT_SETTINGS, type TidyTubeSettings } from '../../src/types/settings';
import { getSettings, saveSettings } from '../../src/utils/storage';

export default function App() {
  const [settings, setSettings] = useState<TidyTubeSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSettings().then((loadedSettings) => {
      setSettings(loadedSettings);
      setLoaded(true);
    });
  }, []);

  const handleToggle = async (key: keyof TidyTubeSettings, value: boolean) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    try {
      await saveSettings({ [key]: value });
    } catch (err) {
      console.error('[TidyTube] Error updating setting:', err);
    }
  };

  return (
    <div className="w-[320px] bg-primary text-onPrimary font-sans select-none pb-2">
      <Header />
      <main className="p-3 space-y-3">
        {/* Homepage Controls */}
        <ToggleGroup
          title="Homepage"
          description="Control algorithmic distractions on the home feed"
        >
          <CheckboxItem
            id="hide-home-recommendations"
            label="Hide recommendations feed"
            description="Replaces the endless home grid with a calm space"
            checked={settings.hideHomeRecommendations}
            onChange={(checked) => handleToggle('hideHomeRecommendations', checked)}
          />
          <CheckboxItem
            id="hide-home-shorts"
            label="Hide Homepage Shorts"
            description="Removes Shorts carousels and shelves"
            checked={settings.hideHomeShorts}
            onChange={(checked) => handleToggle('hideHomeShorts', checked)}
          />
        </ToggleGroup>

        {/* Quick hint */}
        <footer className="px-1 text-[11px] text-onSurface flex justify-between items-center">
          <span>{loaded ? 'Settings synced' : 'Loading settings...'}</span>
          <span className="text-[10px] uppercase tracking-wider text-accent font-medium">
            Live
          </span>
        </footer>
      </main>
    </div>
  );
}
