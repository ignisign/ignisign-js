const path = require('path');
const webpack = require('webpack'); // Importez le module webpack

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'index.js', 
    path: path.resolve(__dirname, 'dist'), 
  },
  mode: 'production', 
  resolve: {
    extensions: ['.ts', '.js'], 
  },
  module: {
    rules: [
      {
        test: /\.ts$/, 
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader', 
            options: {
              presets: ['@babel/preset-env', '@babel/preset-typescript'],
            },
          },
          {
            loader: 'ts-loader', 
          },
        ],
      },
    ],
  },
 /*  plugins: [
    new webpack.ProvidePlugin({
      IGNISIGN_APPLICATION_ENV: ['@ignisign/public', 'IGNISIGN_APPLICATION_ENV'],
      IGNISIGN_BROADCASTABLE_ACTIONS: ['@ignisign/public', 'IGNISIGN_BROADCASTABLE_ACTIONS'],
      IGNISIGN_BROADCASTABLE_ACTIONS_TYPE: ['@ignisign/public', 'IGNISIGN_BROADCASTABLE_ACTIONS_TYPE'],
      IgnisignPrivateFileDto: ['@ignisign/public', 'IgnisignPrivateFileDto'],
    }),
  ], */
};
