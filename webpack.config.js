import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import os from 'os';
import { fileURLToPath } from 'url';
import * as sass from 'sass-embedded';
import setupErrorLogger from './webpack-error-logger.js';
import fs from 'fs';
import webpack from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export default (env, argv) => {
  const isDevelopment = argv.mode === 'development';

  // Get hostname for local development
  const hostname = os.hostname().toLowerCase();

  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js',
      clean: {
        dry: false,
        keep: (asset) => {
          // Keep .git directory and any dot files/directories
          return asset.includes('/.git') || /\/\.[^/]+$/.test(asset);
        }
      }
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  config: path.resolve(__dirname, 'postcss.config.cjs')
                }
              }
            },
            {
              loader: 'sass-loader',
              options: {
                implementation: sass,
                sassOptions: {
                  outputStyle: 'compressed',
                },
              },
            }
          ]
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource'
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        inject: true
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/data/wordlists/*.{json,txt}',
            to: 'data/wordlists/[name][ext]',
            noErrorOnMissing: true
          }
        ]
      }),
      // Handle version information
      new webpack.DefinePlugin({
        'process.env.APP_VERSION': JSON.stringify(
          fs.existsSync(path.resolve(__dirname, 'version.txt'))
            ? (isDevelopment
                ? fs.readFileSync(path.resolve(__dirname, 'version.txt'), 'utf-8').trim() + '+'
                : getFormattedDateTime())
            : getFormattedDateTime()
        )
      }),
    ],
    devServer: {
      static: [
        {
          directory: path.join(__dirname, 'public')
        },
        {
          directory: path.join(__dirname, 'deploy/assets'),
          publicPath: '/assets'
        }
      ],
      hot: true,
      compress: true,
      port: 3000,
      host: isDevelopment ? `${hostname}.local` : 'localhost',
      historyApiFallback: true,
      open: true,
      client: {
        overlay: {
          errors: true,
          warnings: false
        }
      },
      setupMiddlewares: (middlewares, devServer) => {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined');
        }

        // Add error logging middleware
        middlewares.unshift(setupErrorLogger());

        // Add kill endpoint for development
        if (isDevelopment) {
          middlewares.unshift({
            name: 'kill-server',
            path: '/kill',
            middleware: (req, res) => {
              res.writeHead(200, {'Content-Type': 'text/plain'});
              res.end('Server shutting down...\n');

              // Shutdown the server after a brief delay to allow response to be sent
              setTimeout(() => {
                console.log('Received kill request, shutting down server...');
                process.exit(0);
              }, 100);
            }
          });
        }

        return middlewares;
      }
    },
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    },
    // Hide warnings in the browser
    stats: {
      warnings: false
    }
  };
};
