import { useState, useEffect, useCallback } from 'react'

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([])
  const [localIP, setLocalIP] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    if (!window.electronAPI) return
    window.electronAPI.getLocalIP().then(setLocalIP)
    window.electronAPI.getDevices().then(setDevices)

    const unsub = window.electronAPI.onDeviceListChange((updated) => {
      setDevices(updated)
    })

    return unsub
  }, [])

  const selectDevice = useCallback((id: string | null) => {
    setSelected(id)
  }, [])

  return {
    devices,
    localIP,
    selectedDeviceId: selected,
    selectedDevice: devices.find((d) => d.id === selected) || null,
    selectDevice,
  }
}
