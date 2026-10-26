export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  runAt: 'document_start',
  main() {
    console.log('[TidyTube] Content script initialized on YouTube at document_start');
  },
});
