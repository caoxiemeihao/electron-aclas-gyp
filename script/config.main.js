const path = require('path');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));

module.exports = {
  mode: argv.env === 'development' ? 'development' : 'production',
  entry: path.join(__dirname, '../src/main/index.ts'),
  output: {
    path: path.join(__dirname, '../src/main'),
    filename: 'index.js',
  },
  target: 'electron-main',
  node: {
    // Defaults to false for targets node, async-node and electron-main.
    // __dirname: false,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          plugins: ["@babel/plugin-transform-typescript"],
        },
      },
      {
        test: /\.node$/,
        loader: 'node-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.json'],
  },
};
