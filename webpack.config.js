const path = require('path');
const webpack = require('webpack'); // Importez le module webpack

console.log('webpack.config.js');

module.exports = {
  target: 'web',
  node: {
    __dirname: false, // any value not work
  },
  // entry: './src/index.ts',
  // output: {
  //   filename: 'index.js', 
  //   path: path.resolve(__dirname, 'dist'), 
  // },
  module: {
  rules: [
    ...require('./webpack.rules'),
    {
      test: /\.(m?js|node)$/,
     
        parser: {
          javascript: {
            importMeta:false
          },
        },
     
      // parser: { amd: true },
      use: {
        loader: '@zeit/webpack-asset-relocator-loader',
        options: {
          outputAssetBase: 'native_modules',
          emitDirnameAll: true,
        },
      },
    },
  ],
}
  // mode: 'production', 
  // resolve: {
  //   extensions: ['.ts', '.js'], 
  // },
  // module: {
  //   rules: [
  //     {
  //       test: /\.ts$/, 
  //       exclude: /node_modules/,
  //       use: [
  //         {
  //           loader: 'babel-loader', 
  //           options: {
  //             presets: ['@babel/preset-env', '@babel/preset-typescript'],
  //           },
  //         },
  //         {
  //           loader: 'ts-loader', 
  //         },
  //       ],
  //     },
  //   ],
  // },
 /*  plugins: [
    new webpack.ProvidePlugin({
      IGNISIGN_APPLICATION_ENV: ['@ignisign/public', 'IGNISIGN_APPLICATION_ENV'],
      IGNISIGN_BROADCASTABLE_ACTIONS: ['@ignisign/public', 'IGNISIGN_BROADCASTABLE_ACTIONS'],
      IGNISIGN_BROADCASTABLE_ACTIONS_TYPE: ['@ignisign/public', 'IGNISIGN_BROADCASTABLE_ACTIONS_TYPE'],
      IgnisignPrivateFileDto: ['@ignisign/public', 'IgnisignPrivateFileDto'],
    }),
  ], */
};
