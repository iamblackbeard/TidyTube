export interface TidyTubeSettings {
  // Homepage (Master + Sub-toggles)
  hideHomeRecommendations: boolean;
  hideHomeShorts: boolean;

  // Search
  hideSearchShorts: boolean;

  // Watch page (Master + Sub-toggles)
  hideWatchDistractions: boolean;
  hideWatchRecommendations: boolean;
  hideWatchComments: boolean;
  hideWatchEndScreen: boolean;
  hideWatchInfoCards: boolean;

  // Shorts
  redirectShorts: boolean;

  // Playlist
  showPlaylistDuration: boolean;
}

export const DEFAULT_SETTINGS: TidyTubeSettings = {
  hideHomeRecommendations: false,
  hideHomeShorts: false,
  hideSearchShorts: false,
  hideWatchDistractions: false,
  hideWatchRecommendations: false,
  hideWatchComments: false,
  hideWatchEndScreen: false,
  hideWatchInfoCards: false,
  redirectShorts: false,
  showPlaylistDuration: true,
};

export const SETTINGS_STORAGE_KEY = 'tidytube_settings';
