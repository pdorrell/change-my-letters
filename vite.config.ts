import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Get current date/time in YYYY/MM/DD HH:mm format
const getFormattedDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${year}/${month}/${day} ${hours}:${minutes}`;
};

// Get hostname dynamically
const getHostname = () => {
  try {
    return os.hostname().toLowerCase();
  } catch {
    return 'localhost';
  }
};

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
  const hostname = getHostname();

  return {
    root: './src',
    publicDir: false, // No public directory in src
    plugins: [
      react(),
      viteStaticCopy({
        targets: [
          {
            src: 'data/wordlists/*.{json,txt}',
            dest: 'data/wordlists'
          },
          {
            src: '../deploy/assets',
            dest: '.'
          }
        ]
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      }
    },
    define: {
      'process.env.APP_VERSION': JSON.stringify(
        fs.existsSync(path.resolve(__dirname, 'version.txt'))
          ? (isDevelopment
              ? fs.readFileSync(path.resolve(__dirname, 'version.txt'), 'utf-8').trim() + '+'
              : getFormattedDateTime())
          : getFormattedDateTime()
      )
    },
    build: {
      outDir: '../dist',
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            mobx: ['mobx', 'mobx-react-lite']
          }
        }
      }
    },
    server: {
      port: 3000,
      host: isDevelopment ? `${hostname}.local` : 'localhost',
      open: isDevelopment ? `http://${hostname}.local:3000` : true,
      allowedHosts: ['localhost', '.local']
    },
    // Copy assets from deploy directory
    assetsInclude: ['**/*.mp3', '**/*.json', '**/*.txt']
  };
});