import { autoUpdater } from 'electron-updater'
import { BrowserWindow } from 'electron'

autoUpdater.autoDownload = false
autoUpdater.allowPrerelease = false

export function setupUpdater(mainWindow: BrowserWindow): void {
  const send = (channel: string, data?: unknown) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send(channel, data)
    }
  }

  autoUpdater.on('checking-for-update', () => {
    send('update-checking')
  })

  autoUpdater.on('update-available', (info) => {
    send('update-available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    })
  })

  autoUpdater.on('update-not-available', () => {
    send('update-not-available')
  })

  autoUpdater.on('download-progress', (progress) => {
    send('update-download-progress', {
      percent: progress.percent,
      bytesPerSecond: progress.bytesPerSecond,
      total: progress.total,
      transferred: progress.transferred,
    })
  })

  autoUpdater.on('update-downloaded', () => {
    send('update-downloaded')
  })

  autoUpdater.on('error', (err) => {
    send('update-error', err.message)
  })

  autoUpdater.checkForUpdates().catch(() => {
    // silent fail — no network, not a release build, etc.
  })
}

export function downloadUpdate(): void {
  autoUpdater.downloadUpdate()
}

export function installUpdate(): void {
  autoUpdater.quitAndInstall(false, true)
}

export function getUpdateVersion(): string {
  return autoUpdater.currentVersion?.version || ''
}