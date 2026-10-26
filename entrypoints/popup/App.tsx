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

        {/* Search Results Controls */}
        <ToggleGroup
          title="Search Results"
          description="Clean up algorithmic clutter when looking for tutorials"
        >
          <CheckboxItem
            id="hide-search-shorts"
            label="Hide Shorts in search"
            description="Removes Shorts shelves and reels from search results"
            checked={settings.hideSearchShorts}
            onChange={(checked) => handleToggle('hideSearchShorts', checked)}
          />
        </ToggleGroup>

        {/* Watch Page Controls */}
        <ToggleGroup
          title="Watch Page"
          description="Eliminate distractions while viewing video tutorials"
        >
          <CheckboxItem
            id="hide-watch-distractions"
            label="Hide all watch distractions"
            description="Master switch: toggles all watch page controls"
            checked={settings.hideWatchDistractions}
            onChange={handleWatchMasterToggle}
          />
          <CheckboxItem
            id="hide-watch-recommendations"
            label="Hide sidebar recommendations"
            description="Removes related video recommendations sidebar"
            checked={settings.hideWatchRecommendations}
            onChange={(checked) => handleWatchSubToggle('hideWatchRecommendations', checked)}
            indent
          />
          <CheckboxItem
            id="hide-watch-comments"
            label="Hide comments & live chat"
            description="Removes comments section and live chat panel"
            checked={settings.hideWatchComments}
            onChange={(checked) => handleWatchSubToggle('hideWatchComments', checked)}
            indent
          />
          <CheckboxItem
            id="hide-watch-endscreen"
            label="Hide end-screen cards"
            description="Blocks recommended video tiles at video end"
            checked={settings.hideWatchEndScreen}
            onChange={(checked) => handleWatchSubToggle('hideWatchEndScreen', checked)}
            indent
          />
          <CheckboxItem
            id="hide-watch-infocards"
            label="Hide video info cards"
            description="Silences pop-up teaser cards during video"
            checked={settings.hideWatchInfoCards}
            onChange={(checked) => handleWatchSubToggle('hideWatchInfoCards', checked)}
            indent
          />
        </ToggleGroup>

        {/* Shorts Redirection */}
        <ToggleGroup
          title="Shorts Redirection"
          description="Calm standard player playback"
        >
          <CheckboxItem
            id="redirect-shorts"
            label="Redirect Shorts to standard player"
            description="Opens /shorts/:id links in standard /watch?v=:id player"
            checked={settings.redirectShorts}
            onChange={(checked) => handleToggle('redirectShorts', checked)}
          />
        </ToggleGroup>

        {/* Playlist Utilities */}
        <ToggleGroup
          title="Playlist"
          description="Productivity utilities for course and lecture playlists"
        >
          <CheckboxItem
            id="show-playlist-duration"
            label="Show playlist total duration"
            description="Calculates and displays total runtime in the sidebar"
            checked={settings.showPlaylistDuration}
            onChange={(checked) => handleToggle('showPlaylistDuration', checked)}
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
