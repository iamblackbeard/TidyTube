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

  const handleWatchMasterToggle = async (checked: boolean) => {
    const updated: TidyTubeSettings = {
      ...settings,
      hideWatchDistractions: checked,
      hideWatchRecommendations: checked,
      hideWatchComments: checked,
      hideWatchEndScreen: checked,
      hideWatchInfoCards: checked,
    };
    setSettings(updated);
    try {
      await saveSettings(updated);
    } catch (err) {
      console.error('[TidyTube] Error updating master watch setting:', err);
    }
  };

  const handleWatchSubToggle = async (
    key: 'hideWatchRecommendations' | 'hideWatchComments' | 'hideWatchEndScreen' | 'hideWatchInfoCards',
    value: boolean
  ) => {
    const nextSub = {
      hideWatchRecommendations: key === 'hideWatchRecommendations' ? value : settings.hideWatchRecommendations,
      hideWatchComments: key === 'hideWatchComments' ? value : settings.hideWatchComments,
      hideWatchEndScreen: key === 'hideWatchEndScreen' ? value : settings.hideWatchEndScreen,
      hideWatchInfoCards: key === 'hideWatchInfoCards' ? value : settings.hideWatchInfoCards,
    };

    const allChecked =
      nextSub.hideWatchRecommendations &&
      nextSub.hideWatchComments &&
      nextSub.hideWatchEndScreen &&
      nextSub.hideWatchInfoCards;

    const updated: TidyTubeSettings = {
      ...settings,
      ...nextSub,
      hideWatchDistractions: allChecked,
    };

    setSettings(updated);
    try {
      await saveSettings(updated);
    } catch (err) {
      console.error('[TidyTube] Error updating watch sub-setting:', err);
    }
  };

  return (
    <div className="w-[350px] bg-primary text-onPrimary font-sans select-none flex flex-col">
      <Header />
      <main className="overflow-y-auto max-h-[480px] custom-scroll p-3.5 space-y-4 bg-primary">
        {/* Homepage Controls */}
        <ToggleGroup title="Homepage">
          <CheckboxItem
            id="hide-home-recommendations"
            label="Hide home recommendation feed"
            description="Replaces endless homepage grid with a calm space"
            checked={settings.hideHomeRecommendations}
            onChange={(checked) => handleToggle('hideHomeRecommendations', checked)}
          />
          <CheckboxItem
            id="hide-home-shorts"
            label="Hide Shorts shelves"
            description="Removes Shorts carousels and reels from home"
            checked={settings.hideHomeShorts}
            onChange={(checked) => handleToggle('hideHomeShorts', checked)}
          />
        </ToggleGroup>

        <div className="h-px bg-borderSubtle mx-1" />

        {/* Search Results Controls */}
        <ToggleGroup title="Search Results">
          <CheckboxItem
            id="hide-search-shorts"
            label="Hide Shorts in search results"
            description="Focus purely on relevant long-form video results"
            checked={settings.hideSearchShorts}
            onChange={(checked) => handleToggle('hideSearchShorts', checked)}
          />
        </ToggleGroup>

        <div className="h-px bg-borderSubtle mx-1" />

        {/* Watch Page Controls */}
        <ToggleGroup title="Watch Page">
          <CheckboxItem
            id="hide-watch-distractions"
            label="Hide all watch distractions"
            description="Master switch: toggles sidebar, comments & overlays"
            checked={settings.hideWatchDistractions}
            onChange={handleWatchMasterToggle}
            isMaster
          />
          <div className="ml-3 pl-3 border-l border-borderSubtle space-y-0.5 mt-1.5">
            <CheckboxItem
              id="hide-watch-recommendations"
              label="Sidebar recommendations"
              description="Removes related video recommendations sidebar"
              checked={settings.hideWatchRecommendations}
              onChange={(checked) => handleWatchSubToggle('hideWatchRecommendations', checked)}
              indent
            />
            <CheckboxItem
              id="hide-watch-comments"
              label="Comments & live chat"
              description="Removes comments section and live chat panel"
              checked={settings.hideWatchComments}
              onChange={(checked) => handleWatchSubToggle('hideWatchComments', checked)}
              indent
            />
            <CheckboxItem
              id="hide-watch-endscreen"
              label="End-screen video cards"
              description="Blocks recommended video tiles at video end"
              checked={settings.hideWatchEndScreen}
              onChange={(checked) => handleWatchSubToggle('hideWatchEndScreen', checked)}
              indent
            />
            <CheckboxItem
              id="hide-watch-infocards"
              label="Video info teaser cards"
              description="Silences pop-up teaser cards during video"
              checked={settings.hideWatchInfoCards}
              onChange={(checked) => handleWatchSubToggle('hideWatchInfoCards', checked)}
              indent
            />
          </div>
        </ToggleGroup>

        <div className="h-px bg-borderSubtle mx-1" />

        {/* Playback & Utilities */}
        <ToggleGroup title="Player & Utilities">
          <CheckboxItem
            id="redirect-shorts"
            label="Redirect Shorts to standard player"
            description="Opens /shorts/ links in standard video player"
            checked={settings.redirectShorts}
            onChange={(checked) => handleToggle('redirectShorts', checked)}
          />
          <CheckboxItem
            id="show-playlist-duration"
            label="Show playlist total duration"
            description="Calculates total study/course runtime in sidebar"
            checked={settings.showPlaylistDuration}
            onChange={(checked) => handleToggle('showPlaylistDuration', checked)}
          />
        </ToggleGroup>
      </main>

      {/* Footer Zone */}
      <footer className="px-4 py-2.5 bg-surface border-t border-border flex items-center justify-between text-onSurface">
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-activeGreen" />
          <span className="transition-colors">
            {loaded ? 'Synced with YouTube' : 'Syncing...'}
          </span>
        </div>
        <span className="text-[10px] font-mono text-textMuted">
          Esc to close
        </span>
      </footer>
    </div>
  );
}
