"use client"

import { useState, useCallback } from "react"
import { Toolbar } from "@/components/layout/toolbar"
import { Dropzone } from "@/components/ui/dropzone"
import { Viewer } from "@/components/pdf/viewer"
import { loadPdfForRender, type PDFDocumentProxy } from "@/lib/render"

export default function PreviewPage() {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [fileName, setFileName] = useState("")

  const handleFile = useCallback(async (files: File[]) => {
    const f = files[0]
    if (!f) return

    setFileName(f.name)
    const loaded = await loadPdfForRender(f)
    setPdf(loaded)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Toolbar title={fileName || "preview"} />

      <main className="flex flex-1 flex-col">
        {!pdf ? (
          <div className="container mx-auto flex-1 px-4 py-8">
            <Dropzone onFiles={handleFile} accept=".pdf" className="mx-auto max-w-2xl" />
          </div>
        ) : (
          <Viewer pdf={pdf} />
        )}
      </main>
    </div>
  )
}
