"use client"

import { useCallback, useState, useRef } from "react"
import { Upload } from "lucide-react"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

interface DropzoneProps {
  onFiles: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxSize?: number
  className?: string
  children?: React.ReactNode
}

export function Dropzone({
  onFiles,
  accept = ".pdf",
  multiple = false,
  maxSize = 100 * 1024 * 1024,
  className,
  children,
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      const validFiles: File[] = []
      const acceptedTypes = accept.split(",").map((t) => t.trim().toLowerCase())

      for (const file of Array.from(files)) {
        const ext = `.${file.name.split(".").pop()?.toLowerCase()}`
        const isValidType = acceptedTypes.some(
          (t) => t === ext || t === file.type || (t.endsWith("/*") && file.type.startsWith(t.slice(0, -1)))
        )

        if (!isValidType) {
          setError(`invalid file type: ${file.name}`)
          return
        }

        if (file.size > maxSize) {
          setError(`file too large: ${file.name} (max ${Math.round(maxSize / 1024 / 1024)}mb)`)
          return
        }

        validFiles.push(file)
      }

      setError(null)
      onFiles(multiple ? validFiles : [validFiles[0]])
    },
    [accept, maxSize, multiple, onFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      inputRef.current?.click()
    }
  }

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const files = e.clipboardData.files
      if (files.length > 0) {
        handleFiles(files)
      }
    },
    [handleFiles]
  )

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`drop ${accept} files here or click to browse`}
      aria-describedby={error ? "dropzone-error" : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPaste={handlePaste}
      className={cn(
        "relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
        error && "border-destructive",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="sr-only"
        aria-hidden="true"
      />

      {children || (
        <>
          <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
          <p className="text-center font-medium">
            drop files here or click to browse
          </p>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            supports {accept} files up to {Math.round(maxSize / 1024 / 1024)}mb
          </p>
        </>
      )}

      {error && (
        <p id="dropzone-error" role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
