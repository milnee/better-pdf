"use client"

import { useState, useCallback } from "react"
import { Toolbar } from "@/components/layout/toolbar"
import { Dropzone } from "@/components/ui/dropzone"
import { Button } from "@/components/ui/button"
import { loadPdfForRender } from "@/lib/render"
import { Download } from "lucide-react"
import JSZip from "jszip"

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [quality, setQuality] = useState(0.9)

  const handleFile = useCallback(async (files: File[]) => {
    const f = files[0]
    if (!f) return

    setLoading(true)
    setFile(f)
    try {
      const pdf = await loadPdfForRender(f)
      const rendered: string[] = []

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 2 })
        const canvas = document.createElement("canvas")
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext("2d")!
        await page.render({ canvasContext: ctx, viewport }).promise
        rendered.push(canvas.toDataURL("image/jpeg", quality))
      }
      setImages(rendered)
    } catch (e) {
      console.error("failed to convert", e)
    }
    setLoading(false)
  }, [quality])

  const downloadAll = async () => {
    if (images.length === 0) return
    const zip = new JSZip()
    const baseName = file?.name.replace(".pdf", "") || "page"

    images.forEach((img, i) => {
      const data = img.split(",")[1]
      zip.file(`${baseName}-${i + 1}.jpg`, data, { base64: true })
    })

    const blob = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${baseName}-images.zip`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadSingle = (img: string, index: number) => {
    const baseName = file?.name.replace(".pdf", "") || "page"
    const a = document.createElement("a")
    a.href = img
    a.download = `${baseName}-${index + 1}.jpg`
    a.click()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Toolbar title="pdf to jpg" />

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <Dropzone onFiles={handleFile} accept=".pdf" className="mx-auto max-w-2xl" />

          {loading && <p className="mt-4 text-center text-muted-foreground">converting...</p>}

          {images.length > 0 && (
            <>
              <div className="mt-6 flex items-center justify-between">
                <p className="text-muted-foreground">{images.length} pages converted</p>
                <Button onClick={downloadAll}>
                  <Download className="mr-2 h-4 w-4" /> download all as zip
                </Button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {images.map((img, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-lg border">
                    <img src={img} alt={`page ${i + 1}`} className="w-full" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button size="sm" variant="secondary" onClick={() => downloadSingle(img, i)}>
                        <Download className="mr-1 h-3 w-3" /> page {i + 1}
                      </Button>
                    </div>
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
