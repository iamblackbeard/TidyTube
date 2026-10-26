/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './entrypoints/**/*.{html,ts,tsx}',
    './src/**/*.{html,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F0F0F',
        onPrimary: '#F1F1F1',
        surface: '#141414',
        surfaceHover: '#161616',
        onSurface: '#A3A3A3',
        textMuted: '#71717A',
        border: '#232323',
        borderSubtle: '#1F1F1F',
        accent: '#FF0033',
        accentHover: '#E6002E',
        onAccent: '#FFFFFF',
        activeGreen: '#34D399',
        activeGreenBg: 'rgba(6, 78, 59, 0.4)',
      },
    },
  },
  plugins: [],
};
