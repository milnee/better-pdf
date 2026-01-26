"use client"

import { useState, useCallback } from "react"
import { Toolbar } from "@/components/layout/toolbar"
import { Dropzone } from "@/components/ui/dropzone"
import { Button } from "@/components/ui/button"
import { loadPdf } from "@/lib/pdf"
import { downloadBytes } from "@/lib/download"
import { addRecentFile } from "@/components/layout/recent"
import { FileDown } from "lucide-react"

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [compressedData, setCompressedData] = useState<Uint8Array | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFile = useCallback(async (files: File[]) => {
    const f = files[0]
    if (!f) return

    setLoading(true)
    setFile(f)
    setOriginalSize(f.size)

    try {
      const pdf = await loadPdf(f)
      const compressed = await pdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      })
      setCompressedData(compressed)
      setCompressedSize(compressed.length)
      addRecentFile({ name: f.name, size: f.size }, "compress", "/compress")
    } catch (e) {
      console.error("failed to compress", e)
    }
    setLoading(false)
  }, [])

  const handleDownload = () => {
    if (!compressedData || !file) return
    const name = file.name.replace(".pdf", "-compressed.pdf")
    downloadBytes(compressedData, name)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  const savings = originalSize > 0 ? ((1 - compressedSize / originalSize) * 100).toFixed(1) : 0

  return (
    <div className="flex min-h-screen flex-col">
      <Toolbar title="compress pdf" />

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Dropzone onFiles={handleFile} accept=".pdf" />

          {loading && (
            <p className="mt-4 text-center text-muted-foreground">compressing...</p>
          )}

          {compressedData && (
            <div className="mt-8 rounded-lg border p-6">
              <h2 className="font-medium">{file?.name}</h2>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded bg-muted p-4 text-center">
                  <p className="text-sm text-muted-foreground">original</p>
                  <p className="text-2xl font-bold">{formatSize(originalSize)}</p>
                </div>
                <div className="rounded bg-green-500/10 p-4 text-center">
                  <p className="text-sm text-muted-foreground">compressed</p>
                  <p className="text-2xl font-bold text-green-600">{formatSize(compressedSize)}</p>
                </div>
              </div>

              <p className="mt-4 text-center text-muted-foreground">
                {Number(savings) > 0 ? `saved ${savings}%` : "file is already optimized"}
              </p>

              <Button onClick={handleDownload} className="mt-4 w-full">
                <FileDown className="mr-2 h-4 w-4" />
                download compressed pdf
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
