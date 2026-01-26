"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface RecentFile {
  name: string
  size: number
  lastUsed: number
  tool: string
  toolPath: string
}

const STORAGE_KEY = "pdfkit-recent-files"
const MAX_RECENT = 5

export function getRecentFiles(): RecentFile[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function addRecentFile(file: { name: string; size: number }, tool: string, toolPath: string) {
  if (typeof window === "undefined") return
  try {
    const recent = getRecentFiles()
    const existing = recent.findIndex(r => r.name === file.name && r.tool === tool)
    if (existing !== -1) {
      recent.splice(existing, 1)
    }
    recent.unshift({
      name: file.name,
      size: file.size,
      lastUsed: Date.now(),
      tool,
      toolPath,
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
  } catch {
  }
}

export function clearRecentFiles() {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function formatTime(timestamp: number) {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return "yesterday"
  return `${days}d ago`
}

export function RecentFiles() {
  const [files, setFiles] = useState<RecentFile[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setFiles(getRecentFiles())
  }, [])

  const handleClear = () => {
    clearRecentFiles()
    setFiles([])
  }

  if (!mounted || files.length === 0) return null

  return (
    <div className="mt-16 pt-12 border-t">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-muted-foreground">Recent files</h2>
        <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground hover:text-foreground h-8 px-2">
          <X className="h-3.5 w-3.5 mr-1" />
          clear
        </Button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((file, index) => (
          <Link
            key={`${file.name}-${index}`}
            href={file.toolPath}
            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatSize(file.size)} · {formatTime(file.lastUsed)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
