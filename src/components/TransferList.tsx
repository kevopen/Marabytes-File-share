interface TransferListProps {
  transfers: Transfer[]
  onCancel: (id: string) => void
  onOpenFolder: (filePath: string) => void
  downloadPath?: string
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec <= 0) return ''
  return `${formatSize(bytesPerSec)}/s`
}

function statusConfig(status: string) {
  switch (status) {
    case 'sending':
      return { color: 'text-accent-light', bar: 'bg-gradient-to-r from-accent to-accent-light', label: 'Sending...' }
    case 'receiving':
      return { color: 'text-accent-light', bar: 'bg-gradient-to-r from-accent to-accent-light', label: 'Receiving...' }
    case 'completed':
      return { color: 'text-green-400', bar: 'bg-green-400', label: 'Completed' }
    case 'cancelled':
      return { color: 'text-app-text-muted', bar: 'bg-app-border', label: 'Cancelled' }
    case 'error':
      return { color: 'text-red-400', bar: 'bg-red-400', label: 'Error' }
    default:
      return { color: 'text-app-text-muted', bar: 'bg-app-border', label: 'Pending' }
  }
}

function TransferCard({ t, onCancel, onOpenFolder }: {
  t: Transfer
  onCancel: (id: string) => void
  onOpenFolder: (path: string) => void
}) {
  const cfg = statusConfig(t.status)
  const speed = formatSpeed(t.speed)
  const canOpen = t.status === 'completed' && t.targetPath

  return (
    <div
      onClick={() => canOpen && onOpenFolder(t.targetPath!)}
      className={`bg-app-surface backdrop-blur-xl rounded-2xl border border-app-border p-4 transition-all duration-200 ${
        canOpen ? 'cursor-pointer hover:bg-app-surface-hover hover:border-app-border-hover' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            t.status === 'receiving' ? 'bg-green-500/10' : 'bg-accent/10'
          }`}>
            <span className="text-sm">{t.direction === 'send' ? '↑' : '↓'}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-app-text font-medium truncate">{t.fileName}</p>
            <p className="text-[11px] text-app-text-secondary flex items-center gap-1.5">
              <span>{formatSize(t.fileSize)}</span>
              <span className="w-1 h-1 rounded-full bg-app-border" />
              <span>{t.peerName}</span>
              {speed && (
                <>
                  <span className="w-1 h-1 rounded-full bg-app-border" />
                  <span className="text-accent-light">{speed}</span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[11px] font-medium ${cfg.color}`}>{t.progress}%</span>
          {t.status === 'sending' && (
            <button
              onClick={(e) => { e.stopPropagation(); onCancel(t.id) }}
              className="text-[10px] text-app-text-muted hover:text-red-400 transition-colors px-1"
            >✕</button>
          )}
        </div>
      </div>
      <div className="w-full h-1.5 bg-app-border rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${cfg.bar}`} style={{ width: `${t.progress}%` }} />
      </div>
      {canOpen && (
        <p className="text-[9px] text-app-text-muted mt-2 font-mono truncate" title={t.targetPath}>
          📁 {t.targetPath}
        </p>
      )}
    </div>
  )
}

export default function TransferList({ transfers, onCancel, onOpenFolder, downloadPath }: TransferListProps) {
  const active = transfers.filter((t) => t.status === 'sending' || t.status === 'receiving' || t.status === 'pending')
  const history = transfers.filter((t) => t.status !== 'sending' && t.status !== 'receiving' && t.status !== 'pending')

  if (transfers.length === 0) {
    return <div className="text-center py-8"><p className="text-sm text-app-text-muted">No transfers yet</p></div>
  }

  return (
    <div className="space-y-6">
      {active.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-semibold text-app-text-muted uppercase tracking-[0.15em]">Active</h3>
            {active.some(t => t.direction === 'receive') && downloadPath && (
              <span className="text-[9px] text-app-text-muted font-mono truncate max-w-[200px]" title={downloadPath}>↓ {downloadPath}</span>
            )}
          </div>
          <div className="space-y-2">
            {active.map((t) => (
              <TransferCard key={t.id} t={t} onCancel={onCancel} onOpenFolder={onOpenFolder} />
            ))}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-semibold text-app-text-muted uppercase tracking-[0.15em] px-1">History</h3>
          <div className="space-y-1">
            {history.map((t) => {
              const cfg = statusConfig(t.status)
              const canOpen = t.status === 'completed' && t.targetPath
              return (
                <div
                  key={t.id}
                  onClick={() => canOpen && onOpenFolder(t.targetPath!)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    canOpen ? 'cursor-pointer hover:bg-app-glass-hover' : ''
                  }`}
                >
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-accent/10">
                    <span className="text-[10px]">{t.direction === 'send' ? '↑' : '↓'}</span>
                  </div>
                  <p className="text-sm text-app-text flex-1 truncate">{t.fileName}</p>
                  <span className="text-[10px] text-app-text-muted">{t.peerName}</span>
                  <span className={`text-[11px] ${cfg.color}`}>{cfg.label}</span>
                  <span className="text-[11px] text-app-text-muted">{formatSize(t.fileSize)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
