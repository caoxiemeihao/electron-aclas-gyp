// process.cwd() 会指向安装目录，这里强行指向文件所在路
// aclas-cc.node 会以 process.cwd() 寻找 AclasSDK.dll
process.chdir(/* 当没传递 dll_path 时这里非常重要 */__dirname) // 21-01-01 add

const path = require('path');
// const aclas = require('../../../build/Debug/aclas.node');
const aclas = require('../../../build/Release/aclas.node');

const config = {
  host: '192.168.1.2',
  type: 0x0000,
  filename: path.join(__dirname, 'test/plu.txt'),
  // 如果软件安装到中文路径中，不要传递 dll_path 能避开含中文路径加载 AclasSDK.dll 失败问题
  dll_path: path.join(__dirname, /* md5: 35b248a0c1c35c39e90d2f17408b6ea4 */'Win64/AclasSDK.dll'),
  extra: 'C++ | stdout',
  debug: true,
};

aclas(config, () => {});
