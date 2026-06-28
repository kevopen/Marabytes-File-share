type Page = 'share' | 'transfers' | 'settings'

interface SidebarProps {
  activePage: Page
  onNavigate: (page: Page) => void
  deviceCount: number
  localIP: string
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
}: SidebarProps) {
  return (
    <aside className="w-60 flex flex-col bg-black/40 backdrop-blur-2xl border-r border-white/[0.06]">
      <div className="p-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] shadow-lg shadow-[#0ea5e9]/20 flex items-center justify-center">
            <span className="text-white text-sm font-bold tracking-tight">M</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white/90 leading-tight">
              MaraBytes
            </h1>
            <p className="text-[10px] text-white/40 font-medium tracking-wide">
              File Share
            </p>
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
                ? 'bg-white/10 text-white shadow-sm border border-white/[0.06]'
                : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
            }`}
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/[0.06] space-y-2">
        <div className="flex items-center gap-2.5 px-1">
          <div className={`w-2 h-2 rounded-full ${deviceCount > 0 ? 'bg-green-400 shadow-sm shadow-green-400/40' : 'bg-white/20'}`} />
          <span className="text-xs text-white/40">
            {deviceCount > 0 ? `${deviceCount} device${deviceCount > 1 ? 's' : ''} online` : 'No devices'}
          </span>
        </div>
        {localIP && (
          <div className="px-1">
            <span className="text-[10px] text-white/30 font-mono">{localIP}</span>
          </div>
        )}
      </div>
    </aside>
  )
}
