import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getDevices: () => ipcRenderer.invoke('get-devices'),
  getTransfers: () => ipcRenderer.invoke('get-transfers'),
  getLocalIP: () => ipcRenderer.invoke('get-local-ip'),
  sendFile: (deviceId: string) =>
    ipcRenderer.invoke('send-file', deviceId),
  cancelTransfer: (transferId: string) =>
    ipcRenderer.invoke('cancel-transfer', transferId),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  getDownloadPath: () => ipcRenderer.invoke('get-download-path'),
  setDownloadPath: () => ipcRenderer.invoke('set-download-path'),
  openFileFolder: (filePath: string) =>
    ipcRenderer.invoke('open-file-folder', filePath),
  openExternal: (url: string) =>
    ipcRenderer.invoke('open-external', url),

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
})
