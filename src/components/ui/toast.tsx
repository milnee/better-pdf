"use client"

import * as React from "react"
import * as ToastPrimitive from "@radix-ui/react-toast"
import { X } from "lucide-react"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

const ToastContext = React.createContext<{
  toast: (props: ToastProps) => void
} | null>(null)

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "success" | "error"
}

interface ToastItem extends ToastProps {
  id: string
  open: boolean
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const toast = React.useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...props, id, open: true }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, open: false } : t)))
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 200)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            open={t.open}
            onOpenChange={(open) => !open && removeToast(t.id)}
            className={cn(
              "group pointer-events-auto relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-lg border p-4 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
              "bg-background",
              t.variant === "success" && "border-green-500/50 bg-green-500/10",
              t.variant === "error" && "border-destructive/50 bg-destructive/10"
            )}
          >
            <div className="grid gap-1">
              {t.title && (
                <ToastPrimitive.Title className="text-sm font-semibold">
                  {t.title}
                </ToastPrimitive.Title>
              )}
              {t.description && (
                <ToastPrimitive.Description className="text-sm text-muted-foreground">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close
              className="absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:bg-muted focus:opacity-100 focus:outline-none group-hover:opacity-100"
              aria-label="close notification"
            >
              <X className="h-4 w-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within Toaster")
  }
  return context
}
