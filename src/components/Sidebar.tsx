import appIcon from '../assets/app-icon.png'

type Page = 'share' | 'transfers' | 'settings'

interface SidebarProps {
  activePage: Page
  onNavigate: (page: Page) => void
  deviceCount: number
  localIP: string
  appVersion?: string
  updateState?: { status: string; version?: string; progress?: number }
  onDownloadUpdate?: () => void
  onInstallUpdate?: () => void
}

const navItems: { id: Page; label: string; icon: string }[] = [
  { id: 'share', label: 'Share', icon: '↑' },
  { id: 'transfers', label: 'Transfers', icon: '⇄' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

export default function Sidebar({
  activePage,
  onNavigate,
  deviceCount,
  localIP,
  appVersion,
  updateState,
  onDownloadUpdate,
  onInstallUpdate,
}: SidebarProps) {
  return (
    <aside className="w-60 flex flex-col bg-app-bg border-r border-app-border">
      <div className="p-5 border-b border-app-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-black/20">
            <img src={appIcon} alt="MaraBytes" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-app-text leading-tight">MaraBytes</h1>
            <p className="text-[10px] text-app-text-secondary font-medium tracking-wide">File Share</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-200 ${
              activePage === item.id
                ? 'bg-app-glass text-app-text shadow-sm border border-app-border'
                : 'text-app-text-secondary hover:text-app-text hover:bg-app-glass-hover'
            }`}
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Update banner */}
      {updateState?.status === 'available' && (
        <div className="px-3 py-2 mx-3 mb-2 rounded-xl bg-accent/10 border border-accent/20">
          <p className="text-[11px] text-accent-light font-medium">Update v{updateState.version} available</p>
          <button
            onClick={onDownloadUpdate}
            className="text-[10px] text-white bg-accent hover:bg-accent-dark px-2.5 py-1 rounded-lg mt-1.5 transition-colors"
          >
            Download
          </button>
        </div>
      )}
      {updateState?.status === 'downloading' && (
        <div className="px-3 py-2 mx-3 mb-2 rounded-xl bg-accent/10 border border-accent/20">
          <p className="text-[11px] text-accent-light font-medium">Downloading update...</p>
          {typeof updateState.progress === 'number' && (
            <div className="w-full h-1 bg-app-border rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${updateState.progress}%` }} />
            </div>
          )}
        </div>
      )}
      {updateState?.status === 'downloaded' && (
        <div className="px-3 py-2 mx-3 mb-2 rounded-xl bg-green-500/10 border border-green-500/20">
          <p className="text-[11px] text-green-400 font-medium">Update ready to install</p>
          <button
            onClick={onInstallUpdate}
            className="text-[10px] text-white bg-green-500 hover:bg-green-600 px-2.5 py-1 rounded-lg mt-1.5 transition-colors"
          >
            Restart & Install
          </button>
        </div>
      )}

      <div className="p-4 border-t border-app-border space-y-2">
        <div className="flex items-center gap-2.5 px-1">
          <div className={`w-2 h-2 rounded-full ${deviceCount > 0 ? 'bg-green-400 shadow-sm shadow-green-400/40' : 'bg-app-text-muted'}`} />
          <span className="text-xs text-app-text-secondary">
            {deviceCount > 0 ? `${deviceCount} device${deviceCount > 1 ? 's' : ''} online` : 'No devices'}
          </span>
        </div>
        {localIP && (
          <div className="px-1">
            <span className="text-[10px] text-app-text-muted font-mono">{localIP}</span>
          </div>
        )}
        {appVersion && (
          <div className="px-1">
            <span className="text-[10px] text-app-text-muted">v{appVersion}</span>
          </div>
        )}
      </div>
    </aside>
  )
}
