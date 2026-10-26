import type { TidyTubeSettings } from '../types/settings';

export const STYLE_ELEMENT_ID = 'tidytube-dynamic-rules';

/**
 * Generates the CSS rules corresponding to the active TidyTube settings.
 */
export function generateCssRules(settings: TidyTubeSettings): string {
  const rules: string[] = [];

  // Homepage: Recommendations feed
  if (settings.hideHomeRecommendations) {
    rules.push(`
      ytd-browse[page-subtype="home"] #primary,
      ytd-browse[page-subtype="home"] ytd-rich-grid-renderer {
        display: none !important;
      }
    `);
  }

  // Homepage: Shorts shelves
  if (settings.hideHomeShorts) {
    rules.push(`
      ytd-browse[page-subtype="home"] ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]),
      ytd-browse[page-subtype="home"] ytd-rich-section-renderer:has([href*="/shorts"]) {
        display: none !important;
      }
    `);
  }

  // Search: Shorts shelves
  if (settings.hideSearchShorts) {
    rules.push(`
      ytd-search ytd-reel-shelf-renderer,
      ytd-search ytd-shelf-renderer:has([href*="/shorts"]) {
        display: none !important;
      }
    `);
  }

  // Watch page: Secondary recommendations / related sidebar
  if (settings.hideWatchRecommendations) {
    rules.push(`
      ytd-watch-flexy #secondary,
      ytd-watch-flexy #related {
        display: none !important;
      }
    `);
  }

  // Watch page: Comments and live chat
  if (settings.hideWatchComments) {
    rules.push(`
      ytd-watch-flexy #comments,
      ytd-watch-flexy ytd-comments,
      ytd-watch-flexy #chat {
        display: none !important;
      }
    `);
  }

  // Watch page: End-screen video cards
  if (settings.hideWatchEndScreen) {
    rules.push(`
      .ytp-ce-element,
      .ytp-endscreen-content {
        display: none !important;
      }
    `);
  }

  // Watch page: Info cards and teasers
  if (settings.hideWatchInfoCards) {
    rules.push(`
      .ytp-cards-teaser,
      .ytp-cards-button {
        display: none !important;
      }
    `);
  }

  return rules.join('\n');
}

/**
 * Injector that attaches or updates a single dynamic <style> tag in the YouTube page <head>.
 */
export class StyleInjector {
  private static styleElement: HTMLStyleElement | null = null;

  public static update(settings: TidyTubeSettings): void {
    if (typeof document === 'undefined') return;

    const css = generateCssRules(settings);

    let el = this.styleElement;
    if (!el || !document.contains(el)) {
      el = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null;
      if (!el) {
        el = document.createElement('style');
        el.id = STYLE_ELEMENT_ID;
        (document.head || document.documentElement).appendChild(el);
      }
      this.styleElement = el;
    }

    if (el.textContent !== css) {
      el.textContent = css;
    }
  }

  public static remove(): void {
    if (typeof document === 'undefined') return;
    const el = document.getElementById(STYLE_ELEMENT_ID);
    if (el) {
      el.remove();
    }
    this.styleElement = null;
  }
}
