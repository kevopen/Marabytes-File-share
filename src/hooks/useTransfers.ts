import { useState, useEffect, useCallback, useRef } from 'react'

export function useTransfers(onNewIncoming?: (transfer: Transfer) => void) {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const onNewRef = useRef(onNewIncoming)
  onNewRef.current = onNewIncoming

  useEffect(() => {
    if (!window.electronAPI) return
    window.electronAPI.getTransfers().then(setTransfers)

    const unsubNew = window.electronAPI.onTransferNew((t) => {
      setTransfers((prev) => {
        if (prev.find((p) => p.id === t.id)) return prev
        return [t, ...prev]
      })
      if (t.direction === 'receive') {
        onNewRef.current?.(t)
      }
    })

    const unsubProgress = window.electronAPI.onTransferUpdate((t) => {
      setTransfers((prev) => {
        const exists = prev.find((p) => p.id === t.id)
        if (exists) return prev.map((p) => (p.id === t.id ? t : p))
        return [t, ...prev]
      })
    })

    const unsubComplete = window.electronAPI.onTransferComplete((t) => {
      setTransfers((prev) => {
        const exists = prev.find((p) => p.id === t.id)
        if (exists) return prev.map((p) => (p.id === t.id ? { ...t, status: 'completed' as const, progress: 100 } : p))
        return [{ ...t, status: 'completed' as const, progress: 100 }, ...prev]
      })
    })

    return () => {
      unsubNew()
      unsubProgress()
      unsubComplete()
    }
  }, [])

  const sendFile = useCallback(async (deviceId: string) => {
    if (!window.electronAPI) return
    const result = await window.electronAPI.sendFile(deviceId)
    const current = await window.electronAPI.getTransfers()
    setTransfers(current)
    return result
  }, [])

  const cancelTransfer = useCallback((id: string) => {
    if (!window.electronAPI) return
    window.electronAPI.cancelTransfer(id)
    setTransfers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'cancelled' as const } : t))
    )
  }, [])

  return { transfers, sendFile, cancelTransfer }
}
