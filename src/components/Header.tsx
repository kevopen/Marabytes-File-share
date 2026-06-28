import { useState, useEffect } from 'react'

interface HeaderProps {
  localIP: string
}

export default function Header({ localIP }: HeaderProps) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      )
    }
    update()
    const timer = setInterval(update, 30000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="h-12 flex items-center justify-end px-5 bg-black/20 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-sm shadow-green-400/40" />
          <span className="text-[11px] text-white/40 font-mono">{localIP || '...'}</span>
        </div>
        <span className="text-[11px] text-white/30">{time}</span>
      </div>
    </header>
  )
}
