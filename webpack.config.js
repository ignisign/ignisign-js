const path = require('path');

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
};