import { app, BrowserWindow, ipcMain } from 'electron'
import { port } from '../../env'
import aclas from './aclas'

let win: BrowserWindow

function bootstrap() {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
    width: 1024,
    height: 768,
  })

  ipcHandle()

  win.loadURL(`http://127.0.0.1:${port}`)

  if (!app.isPackaged) { // 开发模式下自动打开开发者工具
    win.webContents.openDevTools()
  }
}

function ipcHandle() {
  ipcMain.handle('dispatch-DZC', (event, arg0 = {}) => {
    aclas(arg0, data => {
      event.sender.send('dispatch-DZC-res', data)
    })
  })
}

app.whenReady().then(bootstrap)
app.on('window-all-closed', () => { win = null })
