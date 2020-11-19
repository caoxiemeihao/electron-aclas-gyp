const path = require('path');
const fs = require('fs');
const child_process = require('child_process');
const electron = require('electron');
const webpack = require('webpack');
const argv = require('minimist')(process.argv.slice(2));
const waitOn = require('wait-on');
const env = require('../env');
const webpackConfig = require('./config.main');

const TAG = '[build.main.js]';
const compiler = webpack(webpackConfig);
let child = null;
const main = path.join(__dirname, '..', process.env['npm_package_main']);

if (argv.watch) {
  console.log(TAG, 'wait-on render process started.');
  waitOn({
    resources: [`http://127.0.0.1:${env.port}`],
  }).then(() => {
    console.log(TAG, 'start.');

    compiler.watch({}, (err, stats) => {
      if (err) {
        console.log(TAG, 'webpack 配置报错\n', err.stack);
      } else if (stats.hasErrors()) {
        const errors = stats.toJson().errors;
        console.log(TAG, errors);
      } else {
        console.log(TAG, 'webpack build success.');
        if (child) { child.kill('SIGINT') }
        child = child_process.spawn(electron, [main], { stdio: 'inherit', });
      }
    });
  });
}
