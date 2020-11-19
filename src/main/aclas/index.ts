import { join } from 'path'
import { fork } from 'child_process'
const { log, parse_str2arr } = require('./utils');

/** 子进程运行 */
function runChild(config, callback) {

  const forked = fork(join(__dirname, 'aclas/run-child.js'), { stdio: 'pipe', })
  forked.stdout.on('data', chunk => {
    const str = chunk.toString()
    console.log(str)

    parse_str2arr(str).forEach(item => {
      const { cmd, json } = item;
      json.mode = 'C++';

      if (cmd === 'error') {
        log({ data: str, filename: 'with-cc-error.log', append: false });
        callback({ code: 409, index: -1, total: -1, error: json.msg, extra: host });
      } else if (cmd === 'dispatch') {
        let msg = '';
        if (json.code === -1) {
          msg = '初始化';
        } else if (json.code === 0) {
          msg = '完成';
          forked.kill(); // 可写可不写
          setTimeout(() => callback(json), 90);
        } else if (json.code === 1) {
          msg = '下发中';
          callback(json);
        } else {
          msg = '报错';
          forked.kill(); // 可写可不写
          setTimeout(() => callback(json), 90);
        }
      }
    });
  })
  forked.stderr.on('data', chunk => {
    const str = chunk.toString()
    console.log('ERROR >>\n', str)
  })
}

/** 直接运行: 阻塞线程方式 */
function run() {
  try {
    require('./run')()
  } catch (error) {
    console.log(error)
  }
}

export default runChild
