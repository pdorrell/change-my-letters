import { defineConfig, type Plugin } from 'vite';
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

// Serve files from deploy/assets at /assets during development
function serveDeployAssets(): Plugin {
  const deployAssetsDir = path.resolve(__dirname, 'deploy/assets');
  return {
    name: 'serve-deploy-assets',
    configureServer(server) {
      server.middlewares.use('/assets', (req, res, next) => {
        const filePath = path.join(deployAssetsDir, req.url || '');
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          res.writeHead(200);
          fs.createReadStream(filePath).pipe(res);
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
  const hostname = getHostname();

  return {
    root: './src',
    publicDir: false, // No public directory in src
    plugins: [
      react(),
      ...(isDevelopment ? [serveDeployAssets()] : []),
      viteStaticCopy({
        targets: [
          {
            src: 'data/wordlists/*.{json,txt}',
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
      assetsDir: 'assets/app',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor';
            if (id.includes('node_modules/mobx')) return 'mobx';
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
    assetsInclude: ['**/*.mp3', '**/*.json', '**/*.txt']
  };
});