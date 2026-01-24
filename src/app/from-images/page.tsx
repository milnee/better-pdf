"use client"

import { useState, useCallback } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Toolbar } from "@/components/layout/toolbar"
import { Dropzone } from "@/components/ui/dropzone"
import { Button } from "@/components/ui/button"
import { SortableGrid } from "@/components/pdf/grid"
import { imagesToPdf } from "@/lib/pdf"
import { downloadBytes } from "@/lib/download"
import type { PageSize } from "@/types"

interface ImageFile {
  id: string
  file: File
  name: string
  thumbnail: string
}

export default function FromImagesPage() {
  const [files, setFiles] = useState<ImageFile[]>([])
  const [pageSize, setPageSize] = useState<PageSize>("fit")
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const addFiles = useCallback(async (newFiles: File[]) => {
    setLoading(true)

    const processed: ImageFile[] = []
    for (const file of newFiles) {
      const thumbnail = URL.createObjectURL(file)
      processed.push({
        id: Math.random().toString(36).slice(2),
        file,
        name: file.name,
        thumbnail,
      })
    }

    setFiles((prev) => [...prev, ...processed])
    setLoading(false)
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file) URL.revokeObjectURL(file.thumbnail)
      return prev.filter((f) => f.id !== id)
    })
  }, [])

  const reorderFiles = useCallback((newOrder: ImageFile[]) => {
    setFiles(newOrder)
  }, [])

  const clearAll = useCallback(() => {
    files.forEach((f) => URL.revokeObjectURL(f.thumbnail))
    setFiles([])
  }, [files])

  const handleDownload = useCallback(async () => {
    if (files.length === 0) return

    setDownloading(true)
    try {
      const result = await imagesToPdf(
        files.map((f) => f.file),
        pageSize
      )
      downloadBytes(result, "images.pdf")
    } catch (e) {
      console.error("conversion failed", e)
    }
    setDownloading(false)
  }, [files, pageSize])

  return (
    <div className="flex min-h-screen flex-col">
      <Toolbar
        title="images to pdf"
        onDownload={handleDownload}
        downloading={downloading}
        downloadDisabled={files.length === 0}
        downloadLabel="create pdf"
      />

      <main className="container mx-auto flex-1 px-4 py-8">
        {files.length === 0 ? (
          <Dropzone
            onFiles={addFiles}
            accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
            multiple
            className="mx-auto max-w-2xl"
          >
            <div className="text-center">
              <p className="font-medium">drop images here or click to browse</p>
              <p className="mt-1 text-sm text-muted-foreground">
                supports PNG, JPEG, and WebP
              </p>
            </div>
          </Dropzone>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">{files.length} images</p>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">page size</label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value as PageSize)}
                    className="rounded border bg-background px-3 py-2 text-sm"
                  >
                    <option value="fit">fit to image</option>
                    <option value="a4">A4</option>
                    <option value="letter">Letter</option>
                  </select>
                </div>

                <Button variant="outline" size="sm" onClick={clearAll}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  clear all
                </Button>
              </div>
            </div>

            <SortableGrid
              items={files}
              onReorder={reorderFiles as (items: { id: string; name: string; thumbnail?: string }[]) => void}
              onRemove={removeFile}
            />

            <Dropzone
              onFiles={addFiles}
              accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
              multiple
              className="border-solid"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Plus className="h-5 w-5" />
                <span>add more images</span>
              </div>
            </Dropzone>

            {loading && (
              <p className="text-center text-sm text-muted-foreground">
                processing images...
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
