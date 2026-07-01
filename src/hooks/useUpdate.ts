import { useState, useEffect, useCallback } from 'react'

interface UpdateState {
  status: 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error'
  version?: string
  progress?: number
  error?: string
}

export function useUpdate() {
  const [state, setState] = useState<UpdateState>({ status: 'idle' })
  const [appVersion, setAppVersion] = useState('')

  useEffect(() => {
    if (!window.electronAPI) return

    window.electronAPI.getAppVersion().then(setAppVersion)

    const unsubAvailable = window.electronAPI.onUpdateAvailable((info) => {
      setState({ status: 'available', version: info.version })
    })

    const unsubNotAvailable = window.electronAPI.onUpdateNotAvailable(() => {
      setState({ status: 'idle' })
    })

    const unsubProgress = window.electronAPI.onUpdateDownloadProgress((p) => {
      setState((s) => ({ ...s, status: 'downloading', progress: Math.round(p.percent) }))
    })

    const unsubDownloaded = window.electronAPI.onUpdateDownloaded(() => {
      setState((s) => ({ ...s, status: 'downloaded' }))
    })

    const unsubError = window.electronAPI.onUpdateError((err) => {
      setState({ status: 'error', error: err })
    })

    return () => {
      unsubAvailable()
      unsubNotAvailable()
      unsubProgress()
      unsubDownloaded()
      unsubError()
    }
  }, [])

  const download = useCallback(() => {
    window.electronAPI?.downloadUpdate()
    setState((s) => ({ ...s, status: 'downloading' }))
  }, [])

  const install = useCallback(() => {
    window.electronAPI?.installUpdate()
  }, [])

  return { state, appVersion, download, install }
}