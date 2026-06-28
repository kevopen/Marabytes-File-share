interface DeviceListProps {
  devices: Device[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

function DeviceIcon({ os }: { os: string }) {
  const icons: Record<string, string> = {
    win32: '⊞',
    linux: '🐧',
    darwin: '🍎',
  }
  return <span className="text-base">{icons[os] || '💻'}</span>
}

export default function DeviceList({
  devices,
  selectedId,
  onSelect,
}: DeviceListProps) {
  if (devices.length === 0) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
          </svg>
        </div>
        <p className="text-sm text-white/50 font-medium">No devices found</p>
        <p className="text-xs text-white/30 mt-1">
          Make sure MaraBytes is running on another machine on the same network
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] px-1">
        Devices
      </h3>
      <div className="grid gap-2">
        {devices.map((device) => (
          <button
            key={device.id}
            onClick={() => onSelect(selectedId === device.id ? null : device.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 text-left ${
              selectedId === device.id
                ? 'bg-[#0ea5e9]/10 border-[#0ea5e9]/30 shadow-sm shadow-[#0ea5e9]/5'
                : 'bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.10]'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              selectedId === device.id
                ? 'bg-[#0ea5e9]/15'
                : 'bg-white/[0.04]'
            }`}>
              <DeviceIcon os={device.os} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80 font-medium truncate">
                {device.name}
              </p>
              <p className="text-[11px] text-white/30 font-mono truncate">
                {device.ip}
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-400 shadow-sm shadow-green-400/40 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}
