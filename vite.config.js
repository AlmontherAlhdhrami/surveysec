import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        require('@tailwindcss/postcss'), // Use the PostCSS plugin here as well
      ],
    },
  },
});
