import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/overheid-sru': {
            target: 'https://repository.overheid.nl/sru',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/overheid-sru/, '')
          }
        }
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
