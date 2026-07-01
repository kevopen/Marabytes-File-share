import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import DropZone from './components/DropZone'
import TextShare from './components/TextShare'
import DeviceList from './components/DeviceList'
import TransferList from './components/TransferList'
import ToastContainer, { useToast } from './components/Toast'
import { useDevices } from './hooks/useDevices'
import { useTransfers } from './hooks/useTransfers'
import { useUpdate } from './hooks/useUpdate'

type Page = 'share' | 'transfers' | 'settings'

export default function App() {
  const [activePage, setActivePage] = useState<Page>('share')
  const [shareMode, setShareMode] = useState<'files' | 'text'>('files')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('mb-theme') as 'dark' | 'light') || 'dark'
  })
  const [downloadPath, setDownloadPath] = useState('')
  const [devicesCount, setDevicesCount] = useState(0)
  const { devices, localIP, selectedDeviceId, selectedDevice, selectDevice } = useDevices()
  const { toasts, addToast } = useToast()
  const { state: updateState, appVersion, download: downloadUpdate, install: installUpdate } = useUpdate()
  const { transfers, sendFile, cancelTransfer } = useTransfers(
    useCallback((t: Transfer) => {
      if (t.contentType === 'text') {
        addToast(`New text from ${t.peerName}: "${t.textPreview || '...'}"`, 'info')
      } else {
        addToast(`Receiving ${t.fileName} from ${t.peerName}`, 'info')
      }
    }, [])
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('mb-theme', theme)
  }, [theme])

  useEffect(() => {
    setDevicesCount(devices.length)
  }, [devices])

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getDownloadPath().then(setDownloadPath)
    }
  }, [])

  const handleSendFile = useCallback(() => {
    if (selectedDeviceId) sendFile(selectedDeviceId)
  }, [selectedDeviceId, sendFile])

  const handleSendText = useCallback((text: string) => {
    if (!window.electronAPI || !selectedDeviceId) return
    window.electronAPI.sendText(selectedDeviceId, text).catch((err) => {
      addToast(`Failed to send text: ${err.message}`, 'error')
    })
  }, [selectedDeviceId])

  const handleSetDownloadPath = useCallback(async () => {
    if (!window.electronAPI) return
    const newPath = await window.electronAPI.setDownloadPath()
    if (newPath) {
      setDownloadPath(newPath)
      addToast(`Download location changed to ${newPath}`, 'success')
    }
  }, [])

  const handleOpenFolder = useCallback((filePath: string) => {
    window.electronAPI?.openFileFolder(filePath)
  }, [])

  const handleOpenExternal = useCallback((url: string) => {
    window.electronAPI?.openExternal(url)
  }, [])

  const toggleTheme = () => setTheme((t) => t === 'dark' ? 'light' : 'dark')

  return (
    <div className="flex h-screen bg-app-bg text-app-text select-none">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-dark/[0.02] blur-[100px]" />
      </div>

      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        deviceCount={devicesCount}
        localIP={localIP}
        appVersion={appVersion}
        updateState={updateState}
        onDownloadUpdate={downloadUpdate}
        onInstallUpdate={installUpdate}
      />

      <main className="flex-1 flex flex-col relative">
        <Header localIP={localIP} />

        <div className="flex-1 p-6 overflow-auto">
          {activePage === 'share' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center py-4">
                <h1 className="text-xl font-semibold text-app-text">Share</h1>
                <p className="text-sm text-app-text-secondary mt-1">
                  Select a device, then send files or text
                </p>
              </div>

              <DeviceList devices={devices} selectedId={selectedDeviceId} onSelect={selectDevice} />

              {/* Mode tabs */}
              <div className="flex gap-1 bg-app-glass rounded-xl p-1 border border-app-border">
                <button
                  onClick={() => setShareMode('files')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    shareMode === 'files'
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-app-text-secondary hover:text-app-text'
                  }`}
                >
                  ↑ Files
                </button>
                <button
                  onClick={() => setShareMode('text')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    shareMode === 'text'
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-app-text-secondary hover:text-app-text'
                  }`}
                >
                  T Text
                </button>
              </div>

              {shareMode === 'files' ? (
                <DropZone
                  hasDevices={devices.length > 0}
                  selectedDeviceName={selectedDevice?.name || null}
                  onSendFile={handleSendFile}
                />
              ) : (
                <TextShare
                  hasDevices={devices.length > 0}
                  selectedDeviceName={selectedDevice?.name || null}
                  onSendText={handleSendText}
                />
              )}

              {transfers.length > 0 && (
                <TransferList
                  transfers={transfers}
                  onCancel={cancelTransfer}
                  onOpenFolder={handleOpenFolder}
                />
              )}
            </div>
          )}

          {activePage === 'transfers' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center py-4">
                <h1 className="text-xl font-semibold text-app-text">Transfers</h1>
              </div>
              <TransferList
                transfers={transfers}
                onCancel={cancelTransfer}
                onOpenFolder={handleOpenFolder}
              />
            </div>
          )}

          {activePage === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center py-4">
                <h1 className="text-xl font-semibold text-app-text">Settings</h1>
              </div>

              {/* Theme */}
              <div className="bg-app-glass backdrop-blur-xl rounded-2xl border border-app-border p-5">
                <h2 className="text-sm font-semibold text-app-text mb-3">Appearance</h2>
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-app-surface border border-app-border hover:bg-app-surface-hover transition-colors"
                >
                  <span className="text-sm text-app-text">{theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
                  <div className={`w-10 h-5 rounded-full transition-colors ${theme === 'dark' ? 'bg-accent' : 'bg-app-border'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-[22px]' : 'translate-x-[2px]'} mt-[2px]`} />
                  </div>
                </button>
              </div>

              {/* Download Location */}
              <div className="bg-app-glass backdrop-blur-xl rounded-2xl border border-app-border p-5">
                <h2 className="text-sm font-semibold text-app-text mb-3">Download Location</h2>
                <div className="flex items-center gap-3">
                  <div className="flex-1 px-3 py-2.5 rounded-xl bg-app-surface border border-app-border">
                    <p className="text-xs text-app-text-muted font-mono truncate">{downloadPath || '...'}</p>
                  </div>
                  <button
                    onClick={handleSetDownloadPath}
                    className="px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors shrink-0"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Ports */}
              <div className="bg-app-glass backdrop-blur-xl rounded-2xl border border-app-border p-5">
                <h2 className="text-sm font-semibold text-app-text mb-3">Network</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-app-text-secondary">Transfer Port</span>
                    <span className="text-xs text-app-text-muted font-mono">42070</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-app-text-secondary">Discovery Port</span>
                    <span className="text-xs text-app-text-muted font-mono">42069 (UDP)</span>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="bg-app-glass backdrop-blur-xl rounded-2xl border border-app-border p-5">
                <h2 className="text-sm font-semibold text-app-text mb-3">About</h2>
                <div className="space-y-3">
                  <p className="text-sm text-app-text-secondary">
                    <span className="text-app-text font-medium">MaraBytes File Share</span> — v1.0.0
                  </p>
                  <p className="text-sm text-app-text-secondary">
                    A cross-platform file sharing tool by{' '}
                    <button
                      onClick={() => handleOpenExternal('https://marabytes.co.ke')}
                      className="text-accent hover:text-accent-light transition-colors underline underline-offset-2"
                    >
                      MaraBytes
                    </button>
                    .
                  </p>
                  <p className="text-sm text-app-text-secondary">
                    Transfer files securely over your local network. No internet required.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => handleOpenExternal('https://marabytes.co.ke')}
                      className="text-xs text-app-text-muted hover:text-accent transition-colors"
                    >
                      marabytes.co.ke ↗
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <ToastContainer toasts={toasts} />
    </div>
  )
}
