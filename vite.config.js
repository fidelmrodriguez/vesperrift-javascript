import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks: {
          pixi: ['pixi.js'],
          three: ['three']
        }
      }
    }
  }
});
