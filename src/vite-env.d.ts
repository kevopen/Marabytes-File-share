/// <reference types="vite/client" />

interface Device {
  id: string
  name: string
  ip: string
  port: number
  lastSeen: number
  os: string
}

interface Transfer {
  id: string
  fileName: string
  fileSize: number
  progress: number
  speed: number
  status: 'pending' | 'sending' | 'receiving' | 'completed' | 'cancelled' | 'error'
  peerName: string
  peerIp: string
  direction: 'send' | 'receive'
  targetPath?: string
  error?: string
  startedAt?: number
}

interface ElectronAPI {
  getDevices: () => Promise<Device[]>
  getTransfers: () => Promise<Transfer[]>
  getLocalIP: () => Promise<string>
  sendFile: (deviceId: string) => Promise<{ transferId: string }>
  cancelTransfer: (transferId: string) => Promise<void>
  openFileDialog: () => Promise<string[] | null>
  getDownloadPath: () => Promise<string>
  setDownloadPath: () => Promise<string | null>
  openFileFolder: (filePath: string) => Promise<void>
  openExternal: (url: string) => Promise<void>

  onTransferNew: (callback: (transfer: Transfer) => void) => () => void
  onDeviceListChange: (callback: (devices: Device[]) => void) => () => void
  onTransferUpdate: (callback: (transfer: Transfer) => void) => () => void
  onTransferComplete: (callback: (transfer: Transfer) => void) => () => void
  onError: (callback: (error: string) => void) => () => void
}

interface Window {
  electronAPI?: ElectronAPI
}
