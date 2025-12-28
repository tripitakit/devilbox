import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: {
    port: 3032,
    host: true,
    open: true,
    allowedHosts: ['devilbox.tripitak.it']
  }
});
