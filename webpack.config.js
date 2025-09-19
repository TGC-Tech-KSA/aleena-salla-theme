const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ThemeWatcher = require('@salla.sa/twilight/watcher.js');
const CopyPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const path = require("path");

const asset = file => path.resolve('src/assets', file || '');
const public = file => path.resolve('public', file || '');

module.exports = {
  mode: "production",
  entry: {
    app: [
      asset('styles/app.scss'),
      asset('js/wishlist.js'),
      asset('js/app.js'),
      asset('js/blog.js'),
      asset('js/partials/slider-arrows.js'),
    ],
    home: asset('js/home.js'),
    'product-card': asset('js/partials/product-card.js'),
    'main-menu': asset('js/partials/main-menu.js'),
    'navigation-cart': asset('js/partials/navigation-cart.js'),
    'wishlist-card': asset('js/partials/wishlist-card.js'),
    checkout: [
      asset('js/cart.js'),
      asset('js/thankyou.js'),
    ],
    pages: [
      asset('js/loyalty.js'),
      asset('js/brands.js'),
    ],
    product: [
      asset('js/product.js'),
      asset('js/products.js'),
    ],
    order: asset('js/order.js'),
    testimonials: asset('js/testimonials.js'),
  },
  output: {
    path: public(),
    clean: true,
    chunkFilename: "[name].[contenthash].js",
  },
  stats: { modules: false, assetsSort: "size", assetsSpace: 50 },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [
          /(node_modules)/,
          asset('js/twilight.js'),
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              ['@babel/plugin-transform-runtime', { regenerator: true }],
            ],
          },
        },
      },
      {
        test: /\.(s[ac]ss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { url: false } },
          'postcss-loader',
          'sass-loader',
        ],
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin(),
    ],
  },
  plugins: [
    new ThemeWatcher(),
    new MiniCssExtractPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: asset('images'),
          to: public('images'),
          noErrorOnMissing: true,
        },
      ],
    }),
    new ImageMinimizerPlugin({
      minimizer: {
        implementation: ImageMinimizerPlugin.imageminGenerate,
        options: {
          plugins: [
            ['imagemin-webp', { quality: 75 }],
          ],
        },
      },
      generator: [
        {
          preset: 'webp',
          implementation: ImageMinimizerPlugin.imageminGenerate,
          options: {
            plugins: ['imagemin-webp'],
          },
          filename: '[path][name][ext].webp',
        },
      ],
    }),
  ],
};
