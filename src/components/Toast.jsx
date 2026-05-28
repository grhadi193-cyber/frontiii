import React, { useEffect, useState } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState([])

  function showToast(message, type = 'success') {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }

  return { toasts, showToast }
}

export default function ToastContainer({ toasts }) {
  if (!toasts || toasts.length === 0) return null
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}

function ToastItem({ toast }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-primary',
  }

  return (
    <div
      className={`px-6 py-3 rounded-xl text-white text-sm font-medium shadow-xl transition-all duration-300 pointer-events-auto
        ${colors[toast.type] || colors.success}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
    >
      {toast.type === 'success' && <span className="ml-2">✓</span>}
      {toast.type === 'error' && <span className="ml-2">✗</span>}
      {toast.message}
    </div>
  )
}
