import react from '@vitejs/plugin-react';
import GenerateNotesPlugin from './vite.plugin.generate-notes.js';
import { VitePWA } from 'vite-plugin-pwa';

export default {
  base: '/yuanbao-note-viewer/', // GitHub Pages 的基础路径
  build: {
    rollupOptions: {
      input: {
        main: 'index.html'
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  },
  plugins: [
    react(),
    GenerateNotesPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Yuanbao Note Viewer',
        short_name: 'YuanNote',
        description: 'A note viewer application',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'statics/yuanbao/favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          }
        ],
        start_url: '/yuanbao-note-viewer/',
        display: 'standalone',
        background_color: '#ffffff'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
};