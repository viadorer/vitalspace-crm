'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: {
    success: (message: string) => void
    error: (message: string) => void
    warning: (message: string) => void
    info: (message: string) => void
  }
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TOAST_DURATION = 5000
const MAX_TOASTS = 5

let toastCounter = 0

const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const STYLES: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const ICON_STYLES: Record<ToastType, string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = `toast-${++toastCounter}`
    setToasts(prev => {
      const next = [...prev, { id, message, type }]
      return next.slice(-MAX_TOASTS)
    })
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, TOAST_DURATION)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = {
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    warning: (msg: string) => addToast(msg, 'warning'),
    info: (msg: string) => addToast(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => {
          const Icon = ICONS[t.type]
          return (
            <div
              key={t.id}
              className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg animate-in slide-in-from-right ${STYLES[t.type]}`}
              role="alert"
            >
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${ICON_STYLES[t.type]}`} />
              <p className="text-sm flex-1">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 opacity-60 hover:opacity-100"
                aria-label="Zavřít"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // Fallback for components outside provider — use console
    return {
      toast: {
        success: (msg) => console.log('[toast:success]', msg),
        error: (msg) => console.error('[toast:error]', msg),
        warning: (msg) => console.warn('[toast:warning]', msg),
        info: (msg) => console.log('[toast:info]', msg),
      },
    }
  }
  return ctx
}
