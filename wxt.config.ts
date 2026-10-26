import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'TidyTube',
    description: 'Declutter YouTube and redirect Shorts into standard video players.',
    permissions: ['storage'],
  },
});
