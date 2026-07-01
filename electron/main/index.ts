import { app, BrowserWindow, shell, ipcMain, dialog, Menu } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { DeviceDiscovery } from './discovery'
import { FileTransferServer } from './transfer'
import { setupUpdater, downloadUpdate, installUpdate } from './updater'

const TRANSFER_PORT = 42070

let mainWindow: BrowserWindow | null = null
let discovery: DeviceDiscovery | null = null
let transferServer: FileTransferServer | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    show: false,
    backgroundColor: '#0a0e1a',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function setupServices(): void {
  transferServer = new FileTransferServer(TRANSFER_PORT)
  transferServer.start()

  transferServer.on('new', (transfer) => {
    mainWindow?.webContents.send('transfer-new', transfer)
  })

  transferServer.on('progress', (transfer) => {
    mainWindow?.webContents.send('transfer-progress', transfer)
  })

  transferServer.on('complete', (transfer) => {
    mainWindow?.webContents.send('transfer-complete', transfer)
  })

  transferServer.on('error', (transfer) => {
    mainWindow?.webContents.send('transfer-progress', transfer)
    mainWindow?.webContents.send('app-error', transfer.error || 'Transfer failed')
  })

  discovery = new DeviceDiscovery(TRANSFER_PORT)
  discovery.start()

  discovery.on('devices', (devices) => {
    mainWindow?.webContents.send('device-list-changed', devices)
  })
}

function setupIPC(): void {
  ipcMain.handle('get-devices', () => {
    return discovery?.getDevices() || []
  })

  ipcMain.handle('get-transfers', () => {
    return transferServer?.getTransfers() || []
  })

  ipcMain.handle('get-local-ip', () => {
    return discovery?.getLocalIP() || '127.0.0.1'
  })

  ipcMain.handle('send-text', async (_event, deviceId: string, text: string) => {
    if (!discovery || !transferServer) {
      throw new Error('Services not initialized')
    }

    const devices = discovery.getDevices()
    const target = devices.find((d) => d.id === deviceId)
    if (!target) {
      throw new Error('Device not found')
    }

    const transferId = await transferServer.sendText(
      target.ip,
      target.port,
      text,
      target.name
    )

    return { transferId }
  })

  ipcMain.handle('send-file', async (_event, deviceId: string) => {
    if (!discovery || !transferServer) {
      throw new Error('Services not initialized')
    }

    const devices = discovery.getDevices()
    const target = devices.find((d) => d.id === deviceId)
    if (!target) {
      throw new Error('Device not found')
    }

    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openFile', 'multiSelections'],
    })

    if (result.canceled || result.filePaths.length === 0) {
      throw new Error('No file selected')
    }

    const transferId = await transferServer.sendFile(
      target.ip,
      target.port,
      result.filePaths[0],
      target.name
    )

    return { transferId }
  })

  ipcMain.handle('cancel-transfer', (_event, transferId: string) => {
    transferServer?.cancelTransfer(transferId)
  })

  ipcMain.handle('open-file-dialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openFile', 'multiSelections'],
    })
    if (result.canceled) return null
    return result.filePaths
  })

  ipcMain.handle('get-download-path', () => {
    return transferServer?.getDownloadPath() || ''
  })

  ipcMain.handle('set-download-path', async () => {
    if (!mainWindow) return null
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    })
    if (result.canceled || result.filePaths.length === 0) return null
    const newPath = result.filePaths[0]
    transferServer?.setDownloadPath(newPath)
    return newPath
  })

  ipcMain.handle('open-file-folder', (_event, filePath: string) => {
    shell.showItemInFolder(filePath)
  })

  ipcMain.handle('download-update', () => {
    downloadUpdate()
  })

  ipcMain.handle('install-update', () => {
    installUpdate()
  })

  ipcMain.handle('open-external', (_event, url: string) => {
    shell.openExternal(url)
  })

  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
  })
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  createWindow()
  setupServices()
  setupIPC()
  if (mainWindow) {
    setupUpdater(mainWindow)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  discovery?.stop()
  transferServer?.stop()
})
