const path = require('path');
const fs = require('fs');
const liveServer = require('live-server');
const argv = require('minimist')(process.argv.slice(2));
const env = require('../env');

const TAG = '[build.render.js]';

if (argv.watch) {
  const params = {
    port: env.port,
    host: '0.0.0.0',
    open: false,
    root: path.join(__dirname, '../src/render/public'),
    file: 'index.html',
    wait: 400,
    middleware: [
      function (req, res, next) {
        next();
      }
    ],
  };
  liveServer.start(params);
  // console.log(TAG, `live-server run at ${env.port}`)
}
