"use client"

import { useState, useCallback } from "react"

export interface FileWithId {
  id: string
  file: File
  name: string
}

export function useFiles() {
  const [files, setFiles] = useState<FileWithId[]>([])

  const addFiles = useCallback((newFiles: File[]) => {
    const withIds = newFiles.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      name: file.name,
    }))
    setFiles((prev) => [...prev, ...withIds])
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const reorderFiles = useCallback((fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      const result = [...prev]
      const [removed] = result.splice(fromIndex, 1)
      result.splice(toIndex, 0, removed)
      return result
    })
  }, [])

  const clearFiles = useCallback(() => {
    setFiles([])
  }, [])

  const moveFile = useCallback((id: string, direction: "up" | "down") => {
    setFiles((prev) => {
      const index = prev.findIndex((f) => f.id === id)
      if (index === -1) return prev
      if (direction === "up" && index === 0) return prev
      if (direction === "down" && index === prev.length - 1) return prev

      const result = [...prev]
      const newIndex = direction === "up" ? index - 1 : index + 1
      const [removed] = result.splice(index, 1)
      result.splice(newIndex, 0, removed)
      return result
    })
  }, [])

  return {
    files,
    addFiles,
    removeFile,
    reorderFiles,
    clearFiles,
    moveFile,
    hasFiles: files.length > 0,
  }
}
