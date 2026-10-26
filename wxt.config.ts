import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'TidyTube',
    description: 'Declutter YouTube and redirect Shorts into standard video players.',
    permissions: ['storage'],
    icons: {
      16: 'icons/tidytube-logo-16.png',
      24: 'icons/tidytube-logo-24.png',
      48: 'icons/tidytube-logo-48.png',
      96: 'icons/tidytube-logo-96.png',
      128: 'icons/tidytube-logo-128.png',
    },
  },
});
