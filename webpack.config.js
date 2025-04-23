const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const os = require('os');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';

  // Get hostname for local development
  const hostname = os.hostname().toLowerCase();

  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js',
      clean: true
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
              loader: 'sass-loader',
              options: {
                implementation: require('sass-embedded'),
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
            from: 'src/data', 
            to: 'data' 
          }
        ]
      })
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'public')
      },
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
