import { useState, useCallback } from 'react'

interface DropZoneProps {
  hasDevices: boolean
  selectedDeviceName: string | null
  onSendFile: () => void
}

export default function DropZone({
  hasDevices,
  selectedDeviceName,
  onSendFile,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (hasDevices && selectedDeviceName) onSendFile()
  }, [hasDevices, selectedDeviceName, onSendFile])

  const handleClick = () => {
    if (!hasDevices || !selectedDeviceName) return
    onSendFile()
  }

  const blocked = !hasDevices || !selectedDeviceName

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`relative overflow-hidden rounded-3xl border-2 border-dashed p-14 text-center cursor-pointer transition-all duration-300 ${
        blocked
          ? 'border-app-border bg-app-glass opacity-50 cursor-not-allowed'
          : isDragging
            ? 'border-accent/60 bg-accent/[0.04] scale-[1.02]'
            : 'border-app-border bg-app-glass hover:border-accent/30 hover:bg-accent/[0.02]'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

      <div className="relative flex flex-col items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          blocked ? 'bg-app-surface' : isDragging ? 'bg-accent/15 scale-110' : 'bg-app-glass'
        }`}>
          <svg
            className={`w-8 h-8 transition-colors duration-300 ${
              blocked ? 'text-app-text-muted' : isDragging ? 'text-accent-light' : 'text-app-text-secondary'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>

        <div>
          {blocked ? (
            <>
              <p className="text-base text-app-text-secondary font-medium">
                {!hasDevices ? 'No devices available' : 'Select a device first'}
              </p>
              <p className="text-sm text-app-text-muted mt-1">
                {!hasDevices ? 'Wait for another machine to appear' : 'Click a device from the list above'}
              </p>
            </>
          ) : (
            <>
              <p className="text-base text-app-text font-medium">
                {isDragging ? 'Drop to send' : `Send files to ${selectedDeviceName}`}
              </p>
              <p className="text-sm text-app-text-muted mt-1">or click to choose files</p>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 text-[10px] text-app-text-muted">
          <span>Any file type</span>
          <span className="w-1 h-1 rounded-full bg-app-border" />
          <span>No size limit</span>
          <span className="w-1 h-1 rounded-full bg-app-border" />
          <span>LAN only</span>
        </div>
      </div>
    </div>
  )
}
