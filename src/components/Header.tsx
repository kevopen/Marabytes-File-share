import { useState, useEffect } from 'react'

interface HeaderProps {
  localIP: string
}

export default function Header({ localIP }: HeaderProps) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }
    update()
    const timer = setInterval(update, 30000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="h-12 flex items-center justify-end px-5 bg-app-glass backdrop-blur-xl border-b border-app-border">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-sm shadow-green-400/40" />
          <span className="text-[11px] text-app-text-muted font-mono">{localIP || '...'}</span>
        </div>
        <span className="text-[11px] text-app-text-muted">{time}</span>
      </div>
    </header>
  )
}
