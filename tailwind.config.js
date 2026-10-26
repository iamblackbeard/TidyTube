/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './entrypoints/**/*.{html,ts,tsx}',
    './src/**/*.{html,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f0f0f',
        onPrimary: '#f1f1f1',
        surface: '#181818',
        onSurface: '#aaaaaa',
        border: '#272727',
        accent: '#FF0000',
        onAccent: '#ffffff',
      },
    },
  },
  plugins: [],
};
