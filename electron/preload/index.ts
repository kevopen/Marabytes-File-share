import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getDevices: () => ipcRenderer.invoke('get-devices'),
  getTransfers: () => ipcRenderer.invoke('get-transfers'),
  getLocalIP: () => ipcRenderer.invoke('get-local-ip'),
  sendFile: (deviceId: string) =>
    ipcRenderer.invoke('send-file', deviceId),
  sendText: (deviceId: string, text: string) =>
    ipcRenderer.invoke('send-text', deviceId, text),
  cancelTransfer: (transferId: string) =>
    ipcRenderer.invoke('cancel-transfer', transferId),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  getDownloadPath: () => ipcRenderer.invoke('get-download-path'),
  setDownloadPath: () => ipcRenderer.invoke('set-download-path'),
  openFileFolder: (filePath: string) =>
    ipcRenderer.invoke('open-file-folder', filePath),
  openExternal: (url: string) =>
    ipcRenderer.invoke('open-external', url),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),

  onTransferNew: (callback: (transfer: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, transfer: unknown) =>
      callback(transfer)
    ipcRenderer.on('transfer-new', handler)
    return () => ipcRenderer.removeListener('transfer-new', handler)
  },

  onDeviceListChange: (callback: (devices: unknown[]) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, devices: unknown[]) =>
      callback(devices)
    ipcRenderer.on('device-list-changed', handler)
    return () => ipcRenderer.removeListener('device-list-changed', handler)
  },

  onTransferUpdate: (callback: (transfer: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, transfer: unknown) =>
      callback(transfer)
    ipcRenderer.on('transfer-progress', handler)
    return () => ipcRenderer.removeListener('transfer-progress', handler)
  },

  onTransferComplete: (callback: (transfer: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, transfer: unknown) =>
      callback(transfer)
    ipcRenderer.on('transfer-complete', handler)
    return () => ipcRenderer.removeListener('transfer-complete', handler)
  },

  onError: (callback: (error: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, error: string) =>
      callback(error)
    ipcRenderer.on('app-error', handler)
    return () => ipcRenderer.removeListener('app-error', handler)
  },

  onUpdateAvailable: (callback: (info: { version: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, info: { version: string }) =>
      callback(info)
    ipcRenderer.on('update-available', handler)
    return () => ipcRenderer.removeListener('update-available', handler)
  },

  onUpdateNotAvailable: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('update-not-available', handler)
    return () => ipcRenderer.removeListener('update-not-available', handler)
  },

  onUpdateDownloadProgress: (callback: (progress: { percent: number }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, progress: { percent: number }) =>
      callback(progress)
    ipcRenderer.on('update-download-progress', handler)
    return () => ipcRenderer.removeListener('update-download-progress', handler)
  },

  onUpdateDownloaded: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('update-downloaded', handler)
    return () => ipcRenderer.removeListener('update-downloaded', handler)
  },

  onUpdateError: (callback: (error: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, error: string) =>
      callback(error)
    ipcRenderer.on('update-error', handler)
    return () => ipcRenderer.removeListener('update-error', handler)
  },
})
