"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Toolbar } from "@/components/layout/toolbar"
import { Dropzone } from "@/components/ui/dropzone"
import { Button } from "@/components/ui/button"
import { SortableGrid } from "@/components/pdf/grid"
import { mergePdfs } from "@/lib/pdf"
import { loadPdfForRender, renderPageToDataUrl } from "@/lib/render"
import { downloadBytes } from "@/lib/download"

interface PdfFile {
  id: string
  file: File
  name: string
  thumbnail?: string
  pageCount: number
}

export default function MergePage() {
  const [files, setFiles] = useState<PdfFile[]>([])
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const addFiles = useCallback(async (newFiles: File[]) => {
    setLoading(true)

    const processed: PdfFile[] = []
    for (const file of newFiles) {
      try {
        const pdf = await loadPdfForRender(file)
        const page = await pdf.getPage(1)
        const thumbnail = await renderPageToDataUrl(page, { scale: 0.3 })

        processed.push({
          id: Math.random().toString(36).slice(2),
          file,
          name: file.name,
          thumbnail,
          pageCount: pdf.numPages,
        })
      } catch {
        console.error(`failed to load ${file.name}`)
      }
    }

    setFiles((prev) => [...prev, ...processed])
    setLoading(false)
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const reorderFiles = useCallback((newOrder: PdfFile[]) => {
    setFiles(newOrder)
  }, [])

  const clearAll = useCallback(() => {
    setFiles([])
  }, [])

  const handleDownload = useCallback(async () => {
    if (files.length < 2) return

    setDownloading(true)
    try {
      const merged = await mergePdfs(files.map((f) => f.file))
      downloadBytes(merged, "merged.pdf")
    } catch (e) {
      console.error("merge failed", e)
    }
    setDownloading(false)
  }, [files])

  const totalPages = files.reduce((sum, f) => sum + f.pageCount, 0)

  return (
    <div className="flex min-h-screen flex-col">
      <Toolbar
        title="merge pdfs"
        onDownload={handleDownload}
        downloading={downloading}
        downloadDisabled={files.length < 2}
        downloadLabel={`merge ${files.length} files`}
      />

      <main className="container mx-auto flex-1 px-4 py-8">
        {files.length === 0 ? (
          <Dropzone
            onFiles={addFiles}
            accept=".pdf"
            multiple
            className="mx-auto max-w-2xl"
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {files.length} files · {totalPages} pages total
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                >
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
              accept=".pdf"
              multiple
              className="border-solid"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Plus className="h-5 w-5" />
                <span>add more files</span>
              </div>
            </Dropzone>

            {loading && (
              <p className="text-center text-sm text-muted-foreground">
                processing files...
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
