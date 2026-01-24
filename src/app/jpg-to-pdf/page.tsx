"use client"

import { useState, useCallback } from "react"
import { Toolbar } from "@/components/layout/toolbar"
import { Dropzone } from "@/components/ui/dropzone"
import { Button } from "@/components/ui/button"
import { imagesToPdf } from "@/lib/pdf"
import { downloadBytes } from "@/lib/download"
import { X, GripVertical } from "lucide-react"

interface ImageFile {
  id: string
  file: File
  preview: string
}

export default function JpgToPdfPage() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [downloading, setDownloading] = useState(false)
  const [pageSize, setPageSize] = useState<"fit" | "a4" | "letter">("fit")

  const handleFiles = useCallback((files: File[]) => {
    const newImages = files.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      preview: URL.createObjectURL(file),
    }))
    setImages((prev) => [...prev, ...newImages])
  }, [])

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id)
      if (img) URL.revokeObjectURL(img.preview)
      return prev.filter((i) => i.id !== id)
    })
  }

  const handleDownload = useCallback(async () => {
    if (images.length === 0) return

    setDownloading(true)
    try {
      const files = images.map((i) => i.file)
      const result = await imagesToPdf(files, pageSize)
      downloadBytes(result, "images.pdf")
    } catch (e) {
      console.error("failed to create pdf", e)
    }
    setDownloading(false)
  }, [images, pageSize])

  return (
    <div className="flex min-h-screen flex-col">
      <Toolbar
        title="jpg to pdf"
        onDownload={handleDownload}
        downloading={downloading}
        downloadDisabled={images.length === 0}
      />

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <Dropzone
            onFiles={handleFiles}
            accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
            multiple
            className="mx-auto max-w-2xl"
          />

          {images.length > 0 && (
            <>
              <div className="mt-6 flex items-center justify-between">
                <p className="text-muted-foreground">{images.length} images</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm">page size:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value as typeof pageSize)}
                    className="rounded border bg-background px-2 py-1 text-sm"
                  >
                    <option value="fit">fit to image</option>
                    <option value="a4">A4</option>
                    <option value="letter">letter</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {images.map((img, i) => (
                  <div key={img.id} className="group relative overflow-hidden rounded-lg border">
                    <img src={img.preview} alt={img.file.name} className="aspect-[3/4] w-full object-cover" />
                    <div className="absolute left-2 top-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
                      {i + 1}
                    </div>
                    <button
                      onClick={() => removeImage(img.id)}
                      className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
