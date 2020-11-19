const fs = require('fs')
const path = require('path')

/**
 * log地址：C:\Users\用户\AppData\Local\Temp\ypshop
 * @param {string} data 
 * @param {string} filename 
 */
exports.log = function log({ data = '', filename = 'log.log', append = true }) {
  return new Promise(resolve => {
    const ypshop = path.join(os.tmpdir(), 'ypshop')
    fs.existsSync(ypshop) || fs.mkdirSync(ypshop)
    const _data = new Date().toLocaleString() + '\n' + data + '\n'
    fs[append ? 'appendFile' : 'writeFile'](path.join(ypshop, filename), _data, resolve)
  })
}

/**
 * C++ std::cout | C# Console.WriteLine() 解析
 * 格式: ##数据##
 * @param {string} str 
 */
exports.parse_str2arr = function parse_str2arr(str) {
  let result = []
  // stdout 有两次 Console.WriteLine() 合并的情况，所以 res 是数组
  let res = String(str).trim().match(/(##(\w+)=(\{[\s\S][^##]+\})##)/g)
  if (Array.isArray(res)) {
    res.forEach(r => {
      const tmp = r.match(/^##(\w+)=(\{[\s\S]+\})##$/)
      if (Array.isArray(tmp)) {
        const cmd = tmp[1]
        let json = tmp[2]
        try {
          json = JSON.parse(json.replace(/\n/g, '<br/>'))
        } catch (error) {
          console.log()
          console.log((json))
          console.log('----')
          console.log(error)
          console.log()
          json = {}
        }
        result.push({ cmd, json })
      }
    })
  }

  return result
}

exports.code_dict = {
  256: '已初始化',
  257: '未初始化',
  258: '设备不存在',
  259: '不支持的协议类型',
  260: '该数据类型不支持此操作',
  261: '该数据类型不支持',
  264: '无法打开输入文件',
  265: '字段数与内容数不匹配',
  266: '通讯数据异常',
  267: '解析数据异常',
  268: 'CodePage错误',
  269: '无法创建输出文件',
  0: 'sucessed',
  1: 'processing',
  // 自定义错误
  401: '报错 [写入 plu.txt 失败]',
  403: '报错 [链接超时]',
  404: '报错 [加载 AclasSDK.dll 失败]',
  405: '报错 [polyfill addons.]',
  406: '报错 [子进程拉起多次失败]',
  407: '报错 [C# addons 子进程]',
  408: '报错 [C# addons 正在运行]',
  409: '报错 [trycatch 未知异常]',
  431: '报错 [with-csharp stderr]',
  441: '报错 [with-cc stderr]',
  501: 'ping [超时]',
  502: 'ping [不通]'
}
