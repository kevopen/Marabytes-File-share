import { useState, useEffect, useCallback } from 'react'

interface ToastMessage {
  id: number
  text: string
  type: 'error' | 'success' | 'info'
}

let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((text: string, type: 'error' | 'success' | 'info' = 'info') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, text, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  useEffect(() => {
    if (!window.electronAPI) return
    return window.electronAPI.onError((error) => addToast(error, 'error'))
  }, [addToast])

  return { toasts, addToast }
}

export default function ToastContainer({ toasts }: { toasts: ToastMessage[] }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-2xl backdrop-blur-2xl border text-sm font-medium shadow-2xl animate-in ${
            toast.type === 'error'
              ? 'bg-red-500/15 border-red-500/20 text-red-300'
              : toast.type === 'success'
                ? 'bg-green-500/15 border-green-500/20 text-green-300'
                : 'bg-app-glass border-app-border text-app-text'
          }`}
        >
          {toast.text}
        </div>
      ))}
    </div>
  )
}
