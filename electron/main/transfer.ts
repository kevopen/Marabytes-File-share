import * as http from 'http'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { EventEmitter } from 'events'
import { app } from 'electron'

export interface TransferInfo {
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
  startedAt: number
}

let transferCounter = 0

function generateId(): string {
  transferCounter++
  return `tf-${Date.now()}-${transferCounter}`
}

interface SpeedTracker {
  lastBytes: number
  lastTime: number
  speed: number
}

function trackSpeed(tracker: SpeedTracker, currentBytes: number): number {
  const now = Date.now()
  const elapsed = (now - tracker.lastTime) / 1000
  if (elapsed > 0.4) {
    const bytesDiff = currentBytes - tracker.lastBytes
    tracker.speed = bytesDiff / elapsed
    tracker.lastBytes = currentBytes
    tracker.lastTime = now
  }
  return tracker.speed
}

export class FileTransferServer extends EventEmitter {
  private server: http.Server | null = null
  private port: number
  private transfers: Map<string, TransferInfo> = new Map()
  private speedTrackers: Map<string, SpeedTracker> = new Map()
  private downloadDir: string

  constructor(port: number) {
    super()
    this.port = port
    this.downloadDir = path.join(app.getPath('downloads'), 'MaraBytes')
    if (!fs.existsSync(this.downloadDir)) {
      fs.mkdirSync(this.downloadDir, { recursive: true })
    }
  }

  start(): void {
    this.server = http.createServer((req, res) => {
      if (req.method === 'POST' && req.url === '/upload') {
        this.handleUpload(req, res)
      } else if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ status: 'ok' }))
      } else {
        res.writeHead(404)
        res.end()
      }
    })

    this.server.listen(this.port, '0.0.0.0')
  }

  private handleUpload(req: http.IncomingMessage, res: http.ServerResponse): void {
    const fileName = req.headers['x-file-name'] as string || 'unknown'
    const fileSize = parseInt(req.headers['x-file-size'] as string || '0', 10)
    const peerName = req.headers['x-peer-name'] as string || 'Unknown'
    const peerIp = req.socket.remoteAddress || 'unknown'
    const transferId = generateId()

    const safeName = path.basename(fileName)
    const destPath = path.join(this.downloadDir, safeName)
    const writeStream = fs.createWriteStream(destPath)

    const tracker: SpeedTracker = { lastBytes: 0, lastTime: Date.now(), speed: 0 }

    const transfer: TransferInfo = {
      id: transferId,
      fileName: safeName,
      fileSize,
      progress: 0,
      speed: 0,
      status: 'receiving',
      peerName,
      peerIp: peerIp.replace('::ffff:', ''),
      direction: 'receive',
      targetPath: destPath,
      startedAt: Date.now(),
    }

    this.transfers.set(transferId, transfer)
    this.speedTrackers.set(transferId, tracker)
    this.emit('new', transfer)

    let received = 0
    req.on('data', (chunk: Buffer) => {
      received += chunk.length
      transfer.progress = fileSize > 0 ? Math.round((received / fileSize) * 100) : 0
      transfer.speed = trackSpeed(tracker, received)
      this.emit('progress', { ...transfer })
    })

    writeStream.on('finish', () => {
      transfer.status = 'completed'
      transfer.progress = 100
      transfer.speed = 0
      this.emit('complete', { ...transfer })
      this.speedTrackers.delete(transferId)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok', transferId }))
    })

    req.on('end', () => {
      writeStream.end()
    })

    req.on('error', (err) => {
      transfer.status = 'error'
      transfer.error = err.message
      transfer.speed = 0
      this.emit('error', { ...transfer })
      this.speedTrackers.delete(transferId)
      res.writeHead(500)
      res.end()
    })

    req.pipe(writeStream)
  }

  async sendFile(
    targetIp: string,
    targetPort: number,
    filePath: string,
    peerName: string
  ): Promise<string> {
    const stats = fs.statSync(filePath)
    const fileName = path.basename(filePath)
    const transferId = generateId()

    const tracker: SpeedTracker = { lastBytes: 0, lastTime: Date.now(), speed: 0 }

    const transfer: TransferInfo = {
      id: transferId,
      fileName,
      fileSize: stats.size,
      progress: 0,
      speed: 0,
      status: 'pending',
      peerName,
      peerIp: targetIp,
      direction: 'send',
      startedAt: Date.now(),
    }

    this.transfers.set(transferId, transfer)
    this.speedTrackers.set(transferId, tracker)

    const options = {
      hostname: targetIp,
      port: targetPort,
      path: '/upload',
      method: 'POST',
      headers: {
        'x-file-name': fileName,
        'x-file-size': stats.size.toString(),
        'x-peer-name': os.hostname(),
        'Content-Length': stats.size,
      },
    }

    const req = http.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => (body += chunk))
      res.on('end', () => {
        if (res.statusCode === 200) {
          transfer.status = 'completed'
          transfer.progress = 100
          transfer.speed = 0
          this.emit('complete', { ...transfer })
        } else {
          transfer.status = 'error'
          transfer.error = `Server returned ${res.statusCode}`
          transfer.speed = 0
          this.emit('error', { ...transfer })
        }
        this.speedTrackers.delete(transferId)
      })
    })

    req.on('error', (err) => {
      transfer.status = 'error'
      transfer.error = err.message
      transfer.speed = 0
      this.emit('error', { ...transfer })
      this.speedTrackers.delete(transferId)
    })

    transfer.status = 'sending'
    this.emit('new', { ...transfer })

    const readStream = fs.createReadStream(filePath)
    let sent = 0
    readStream.on('data', (chunk: Buffer) => {
      sent += chunk.length
      transfer.progress = Math.round((sent / stats.size) * 100)
      transfer.speed = trackSpeed(tracker, sent)
      this.emit('progress', { ...transfer })
    })

    readStream.pipe(req)

    return transferId
  }

  cancelTransfer(transferId: string): void {
    const transfer = this.transfers.get(transferId)
    if (transfer && (transfer.status === 'pending' || transfer.status === 'sending')) {
      transfer.status = 'cancelled'
      transfer.speed = 0
      this.emit('progress', { ...transfer })
      this.speedTrackers.delete(transferId)
    }
  }

  getTransfers(): TransferInfo[] {
    return Array.from(this.transfers.values()).sort(
      (a, b) => b.startedAt - a.startedAt
    )
  }

  getDownloadPath(): string {
    return this.downloadDir
  }

  setDownloadPath(newPath: string): void {
    this.downloadDir = newPath
    if (!fs.existsSync(this.downloadDir)) {
      fs.mkdirSync(this.downloadDir, { recursive: true })
    }
  }

  stop(): void {
    if (this.server) {
      this.server.close()
      this.server = null
    }
  }
}
