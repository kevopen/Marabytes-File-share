import { useState, useCallback, useRef } from 'react'

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
    if (hasDevices && selectedDeviceName) {
      onSendFile()
    }
  }, [hasDevices, selectedDeviceName, onSendFile])

  const handleClick = () => {
    if (!hasDevices || !selectedDeviceName) return
    onSendFile()
  }

  const blocked = !hasDevices || !selectedDeviceName

  return (
    <div className="relative">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative overflow-hidden rounded-3xl border-2 border-dashed p-14 text-center cursor-pointer transition-all duration-300 ${
          blocked
            ? 'border-white/[0.06] bg-white/[0.02] opacity-50 cursor-not-allowed'
            : isDragging
              ? 'border-[#0ea5e9]/60 bg-[#0ea5e9]/[0.04] scale-[1.02]'
              : 'border-white/[0.08] bg-white/[0.03] hover:border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/[0.02]'
        }`}
      >
        {/* Glass reflection */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

        <div className="relative flex flex-col items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              blocked
                ? 'bg-white/[0.03]'
                : isDragging
                  ? 'bg-[#0ea5e9]/15 scale-110'
                  : 'bg-white/[0.05] group-hover:bg-[#0ea5e9]/10'
            }`}
          >
            <svg
              className={`w-8 h-8 transition-colors duration-300 ${
                blocked ? 'text-white/20' : isDragging ? 'text-[#38bdf8]' : 'text-white/40'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>

          <div>
            {blocked ? (
              <>
                <p className="text-base text-white/40 font-medium">
                  {!hasDevices
                    ? 'No devices available'
                    : 'Select a device first'}
                </p>
                <p className="text-sm text-white/25 mt-1">
                  {!hasDevices
                    ? 'Wait for another machine to appear'
                    : 'Click a device from the list above'}
                </p>
              </>
            ) : (
              <>
                <p className="text-base text-white/70 font-medium">
                  {isDragging
                    ? 'Drop to send'
                    : `Send files to ${selectedDeviceName}`}
                </p>
                <p className="text-sm text-white/30 mt-1">
                  or click to choose files
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 text-[10px] text-white/20">
            <span>Any file type</span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span>No size limit</span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span>LAN only</span>
          </div>
        </div>
      </div>
    </div>
  )
}
