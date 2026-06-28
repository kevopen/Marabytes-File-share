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
      <div className="bg-app-glass backdrop-blur-xl rounded-2xl border border-app-border p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-app-surface flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-app-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
          </svg>
        </div>
        <p className="text-sm text-app-text-secondary font-medium">No devices found</p>
        <p className="text-xs text-app-text-muted mt-1">
          Make sure MaraBytes is running on another machine on the same network
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-[10px] font-semibold text-app-text-muted uppercase tracking-[0.15em] px-1">Devices</h3>
      <div className="grid gap-2">
        {devices.map((device) => (
          <button
            key={device.id}
            onClick={() => onSelect(selectedId === device.id ? null : device.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 text-left ${
              selectedId === device.id
                ? 'bg-accent/10 border-accent/30 shadow-sm shadow-accent/5'
                : 'bg-app-surface border-app-border hover:bg-app-surface-hover hover:border-app-border-hover'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              selectedId === device.id ? 'bg-accent/15' : 'bg-app-glass'
            }`}>
              <DeviceIcon os={device.os} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-app-text font-medium truncate">{device.name}</p>
              <p className="text-[11px] text-app-text-muted font-mono truncate">{device.ip}</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-400 shadow-sm shadow-green-400/40 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}
