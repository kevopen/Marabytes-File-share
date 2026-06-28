import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import DropZone from './components/DropZone'
import DeviceList from './components/DeviceList'
import TransferList from './components/TransferList'
import ToastContainer, { useToast } from './components/Toast'
import { useDevices } from './hooks/useDevices'
import { useTransfers } from './hooks/useTransfers'

type Page = 'share' | 'transfers' | 'settings'

export default function App() {
  const [activePage, setActivePage] = useState<Page>('share')
  const { devices, localIP, selectedDeviceId, selectedDevice, selectDevice } = useDevices()
  const { transfers, sendFile, cancelTransfer } = useTransfers()
  const { toasts } = useToast()

  return (
    <div className="flex h-screen bg-[#060912] text-white select-none">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#0ea5e9]/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#0284c7]/[0.02] blur-[100px]" />
      </div>

      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        deviceCount={devices.length}
        localIP={localIP}
      />

      <main className="flex-1 flex flex-col relative">
        <Header localIP={localIP} />

        <div className="flex-1 p-6 overflow-auto">
          {activePage === 'share' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Header */}
              <div className="text-center py-4">
                <h1 className="text-xl font-semibold text-white/90">
                  Share Files
                </h1>
                <p className="text-sm text-white/40 mt-1">
                  Select a device, then drag & drop or pick a file
                </p>
              </div>

              {/* Device Selection */}
              <DeviceList
                devices={devices}
                selectedId={selectedDeviceId}
                onSelect={selectDevice}
              />

              {/* Drop Zone */}
              <DropZone
                hasDevices={devices.length > 0}
                selectedDeviceName={selectedDevice?.name || null}
                onSendFile={() => selectedDeviceId && sendFile(selectedDeviceId)}
              />

              {/* Recent Transfers */}
              {transfers.length > 0 && (
                <TransferList
                  transfers={transfers.filter(t => t.direction === 'send')}
                  onCancel={cancelTransfer}
                />
              )}
            </div>
          )}

          {activePage === 'transfers' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center py-4">
                <h1 className="text-xl font-semibold text-white/90">Transfers</h1>
              </div>
              <TransferList
                transfers={transfers}
                onCancel={cancelTransfer}
              />
            </div>
          )}

          {activePage === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center py-4">
                <h1 className="text-xl font-semibold text-white/90">Settings</h1>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/70 font-medium">Transfer Port</p>
                      <p className="text-xs text-white/30">42070</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/70 font-medium">Discovery Port</p>
                      <p className="text-xs text-white/30">42069 (UDP)</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/70 font-medium">Download Location</p>
                      <p className="text-xs text-white/30">~/Downloads/MaraBytes</p>
                    </div>
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
