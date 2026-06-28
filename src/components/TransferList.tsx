interface TransferListProps {
  transfers: Transfer[]
  onCancel: (id: string) => void
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function statusConfig(status: string) {
  switch (status) {
    case 'sending':
      return { color: 'text-[#38bdf8]', bar: 'bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]', label: 'Sending...' }
    case 'receiving':
      return { color: 'text-[#38bdf8]', bar: 'bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]', label: 'Receiving...' }
    case 'completed':
      return { color: 'text-green-400', bar: 'bg-green-400', label: 'Completed' }
    case 'cancelled':
      return { color: 'text-white/30', bar: 'bg-white/10', label: 'Cancelled' }
    case 'error':
      return { color: 'text-red-400', bar: 'bg-red-400', label: 'Error' }
    default:
      return { color: 'text-white/30', bar: 'bg-white/10', label: 'Pending' }
  }
}

export default function TransferList({ transfers, onCancel }: TransferListProps) {
  const active = transfers.filter((t) => t.status === 'sending' || t.status === 'receiving' || t.status === 'pending')
  const history = transfers.filter((t) => t.status !== 'sending' && t.status !== 'receiving' && t.status !== 'pending')

  if (transfers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-white/30">No transfers yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {active.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] px-1">
            Active
          </h3>
          <div className="space-y-2">
            {active.map((t) => {
              const cfg = statusConfig(t.status)
              return (
                <div
                  key={t.id}
                  className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        t.direction === 'send' ? 'bg-[#0ea5e9]/10' : 'bg-green-500/10'
                      }`}>
                        <span className="text-sm">{t.direction === 'send' ? '↑' : '↓'}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white/80 font-medium truncate">
                          {t.fileName}
                        </p>
                        <p className="text-[11px] text-white/30">
                          {formatSize(t.fileSize)} · {t.peerName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[11px] font-medium ${cfg.color}`}>
                        {t.progress}%
                      </span>
                      {t.status === 'sending' && (
                        <button
                          onClick={() => onCancel(t.id)}
                          className="text-[10px] text-white/30 hover:text-red-400 transition-colors px-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${cfg.bar}`}
                      style={{ width: `${t.progress}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] px-1">
            History
          </h3>
          <div className="space-y-1">
            {history.map((t) => {
              const cfg = statusConfig(t.status)
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors"
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    t.status === 'completed' ? 'bg-green-400' :
                    t.status === 'error' ? 'bg-red-400' : 'bg-white/20'
                  }`} />
                  <p className="text-sm text-white/60 flex-1 truncate">{t.fileName}</p>
                  <span className={`text-[11px] ${cfg.color}`}>{cfg.label}</span>
                  <span className="text-[11px] text-white/20">{formatSize(t.fileSize)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
