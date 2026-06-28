import { useState, useEffect, useCallback } from 'react'

export function useTransfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([])

  useEffect(() => {
    if (!window.electronAPI) return
    window.electronAPI.getTransfers().then(setTransfers)

    const unsubProgress = window.electronAPI.onTransferUpdate((t) => {
      setTransfers((prev) =>
        prev.map((p) => (p.id === t.id ? t : p))
      )
    })

    const unsubComplete = window.electronAPI.onTransferComplete((t) => {
      setTransfers((prev) =>
        prev.map((p) => (p.id === t.id ? { ...t, status: 'completed', progress: 100 } : p))
      )
    })

    return () => {
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
