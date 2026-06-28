export interface Device {
  id: string
  name: string
  ip: string
  port: number
  lastSeen: number
  os: string
}

export interface Transfer {
  id: string
  fileName: string
  fileSize: number
  progress: number
  status: 'pending' | 'sending' | 'receiving' | 'completed' | 'cancelled' | 'error'
  peerName: string
  peerIp: string
  direction: 'send' | 'receive'
  error?: string
  startedAt?: number
}

export type TransferStatus = Transfer['status']

export interface ElectronAPI {
  getDevices: () => Device[]
  getTransfers: () => Transfer[]
  getLocalIP: () => string
  sendFile: (deviceId: string, filePath: string) => Promise<{ transferId: string }>
  cancelTransfer: (transferId: string) => void
  openFileDialog: () => Promise<string[] | null>
  onDeviceListChange: (callback: (devices: Device[]) => void) => () => void
  onTransferUpdate: (callback: (transfer: Transfer) => void) => () => void
  onTransferComplete: (callback: (transfer: Transfer) => void) => () => void
  onError: (callback: (error: string) => void) => () => void
}
