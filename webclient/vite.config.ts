import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: '../_datafiles/html/public/app',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './src/main.ts',
      },
      output: {
        entryFileNames: 'assets/webclient.[name].js',
        chunkFileNames: 'assets/webclient.[name].js',
        assetFileNames: 'assets/webclient.[name][extname]',
      },
    },
  },
  server: {
    proxy: {
      '/ws': {
        target: 'ws://localhost:80',
        ws: true,
        changeOrigin: true,
      },
      '/static': {
        target: 'http://localhost:80',
        changeOrigin: true,
      },
    },
  },
})
