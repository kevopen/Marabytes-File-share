import * as dgram from 'dgram'
import * as os from 'os'
import * as crypto from 'crypto'
import { EventEmitter } from 'events'

const DISCOVERY_PORT = 42069
const BROADCAST_INTERVAL = 3000
const PEER_TIMEOUT = 12000

export interface DeviceInfo {
  id: string
  name: string
  ip: string
  port: number
  os: string
  lastSeen: number
}

function getLocalIP(): string {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name]
    if (!iface) continue
    for (const info of iface) {
      if (info.family === 'IPv4' && !info.internal) {
        return info.address
      }
    }
  }
  return '127.0.0.1'
}

function getDeviceName(): string {
  return os.hostname()
}

const instanceId = crypto.randomUUID().slice(0, 8)

export class DeviceDiscovery extends EventEmitter {
  private socket: dgram.Socket | null = null
  private broadcastTimer: ReturnType<typeof setInterval> | null = null
  private cleanupTimer: ReturnType<typeof setInterval> | null = null
  private devices: Map<string, DeviceInfo> = new Map()
  private localIP: string
  private deviceName: string
  private transferPort: number

  constructor(transferPort: number) {
    super()
    this.localIP = getLocalIP()
    this.deviceName = getDeviceName()
    this.transferPort = transferPort
  }

  start(): void {
    this.socket = dgram.createSocket({ type: 'udp4', reuseAddr: true })

    this.socket.on('message', (msg, rinfo) => {
      try {
        const data = JSON.parse(msg.toString())
        if (data.id === instanceId) return
        const device: DeviceInfo = {
          id: data.id,
          name: data.name,
          ip: rinfo.address,
          port: data.port,
          os: data.os || 'unknown',
          lastSeen: Date.now(),
        }
        this.devices.set(device.id, device)
        this.emit('devices', this.getDevices())
      } catch {
        // ignore malformed messages
      }
    })

    this.socket.on('error', (err) => {
      console.error('Discovery socket error:', err.message)
    })

    this.socket.bind(DISCOVERY_PORT, () => {
      this.socket!.setBroadcast(true)
    })

    this.broadcastTimer = setInterval(() => {
      this.broadcast()
    }, BROADCAST_INTERVAL)

    this.cleanupTimer = setInterval(() => {
      const now = Date.now()
      let changed = false
      for (const [id, device] of this.devices) {
        if (now - device.lastSeen > PEER_TIMEOUT) {
          this.devices.delete(id)
          changed = true
        }
      }
      if (changed) {
        this.emit('devices', this.getDevices())
      }
    }, PEER_TIMEOUT / 2)

    this.broadcast()
  }

  private broadcast(): void {
    if (!this.socket) return
    const message = JSON.stringify({
      id: instanceId,
      name: this.deviceName,
      port: this.transferPort,
      os: os.platform(),
    })
    this.socket.send(message, DISCOVERY_PORT, '255.255.255.255')
  }

  getDevices(): DeviceInfo[] {
    return Array.from(this.devices.values()).sort((a, b) => a.name.localeCompare(b.name))
  }

  getLocalIP(): string {
    return this.localIP
  }

  getLocalDeviceId(): string {
    return instanceId
  }

  stop(): void {
    if (this.broadcastTimer) {
      clearInterval(this.broadcastTimer)
      this.broadcastTimer = null
    }
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }
}
