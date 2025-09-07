"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"

const ToastContext = createContext({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
})

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = (toast) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { id, ...toast }
    setToasts((prev) => [...prev, newToast])

    // Auto remove toast after duration
    if (toast.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 5000)
    }
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function Toast({ toast, onRemove }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(toast.id), 200)
  }

  const getVariantClasses = () => {
    switch (toast.variant) {
      case 'destructive':
        return 'bg-red-500 text-white border-red-600'
      case 'success':
        return 'bg-green-500 text-white border-green-600'
      default:
        return 'bg-white text-gray-900 border-gray-200'
    }
  }

  return (
    <div
      className={`${getVariantClasses()} border rounded-lg shadow-lg p-4 min-w-[300px] max-w-[400px] transform transition-all duration-200 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {toast.title && (
            <h4 className="font-semibold text-sm mb-1">{toast.title}</h4>
          )}
          {toast.description && (
            <p className="text-sm opacity-90">{toast.description}</p>
          )}
        </div>
        <button
          onClick={handleRemove}
          className="ml-4 text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function Toaster() {
  return null // This component is just for the import, actual functionality is in ToastProvider
}
