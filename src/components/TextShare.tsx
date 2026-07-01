import { useState, useCallback } from 'react'

interface TextShareProps {
  hasDevices: boolean
  selectedDeviceName: string | null
  onSendText: (text: string) => void
}

export default function TextShare({ hasDevices, selectedDeviceName, onSendText }: TextShareProps) {
  const [text, setText] = useState('')

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || !hasDevices || !selectedDeviceName) return
    onSendText(trimmed)
    setText('')
  }, [text, hasDevices, selectedDeviceName, onSendText])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSend()
    }
  }, [handleSend])

  const blocked = !hasDevices || !selectedDeviceName

  return (
    <div className="bg-app-glass backdrop-blur-xl rounded-2xl border border-app-border overflow-hidden">
      <div className="p-5 space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={blocked ? 'Select a device first...' : `Type or paste text to send to ${selectedDeviceName}...`}
          disabled={blocked}
          rows={6}
          className="w-full resize-none bg-app-surface border border-app-border rounded-xl p-4 text-sm text-app-text placeholder:text-app-text-muted outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all disabled:opacity-40"
        />

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-app-text-muted">
            {text.length > 0 ? `${text.length} characters` : ''}
            {' — '}Ctrl+Enter to send
          </span>
          <button
            onClick={handleSend}
            disabled={blocked || !text.trim()}
            className="px-5 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Send Text
          </button>
        </div>
      </div>
    </div>
  )
}