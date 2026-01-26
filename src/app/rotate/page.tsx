"use client"

import { useState, useCallback } from "react"
import { Toolbar } from "@/components/layout/toolbar"
import { Dropzone } from "@/components/ui/dropzone"
import { Button } from "@/components/ui/button"
import { loadPdfForRender, type PDFDocumentProxy } from "@/lib/render"
import { downloadBytes } from "@/lib/download"
import { addRecentFile } from "@/components/layout/recent"
import { FileDown, RotateCw, RotateCcw } from "lucide-react"
import { PDFDocument, degrees } from "pdf-lib"

type Rotation = 0 | 90 | 180 | 270

export default function RotatePage() {
  const [file, setFile] = useState<File | null>(null)
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const [rotations, setRotations] = useState<Rotation[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleFile = useCallback(async (files: File[]) => {
    const f = files[0]
    if (!f) return

    setLoading(true)
    setFile(f)

    try {
      const loaded = await loadPdfForRender(f)
      setPdf(loaded)

      const thumbs: string[] = []
      for (let i = 1; i <= loaded.numPages; i++) {
        const page = await loaded.getPage(i)
        const viewport = page.getViewport({ scale: 0.3 })
        const canvas = document.createElement("canvas")
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext("2d")!
        await page.render({ canvasContext: ctx, viewport }).promise
        thumbs.push(canvas.toDataURL("image/png"))
      }
      setThumbnails(thumbs)
      setRotations(new Array(loaded.numPages).fill(0))
      addRecentFile({ name: f.name, size: f.size }, "rotate pdf", "/rotate")
    } catch (e) {
      console.error("failed to load pdf", e)
    }
    setLoading(false)
  }, [])

  const rotatePageCW = (index: number) => {
    setRotations(prev => {
      const newRotations = [...prev]
      newRotations[index] = ((newRotations[index] + 90) % 360) as Rotation
      return newRotations
    })
  }

  const rotatePageCCW = (index: number) => {
    setRotations(prev => {
      const newRotations = [...prev]
      newRotations[index] = ((newRotations[index] - 90 + 360) % 360) as Rotation
      return newRotations
    })
  }

  const rotateAllCW = () => {
    setRotations(prev => prev.map(r => ((r + 90) % 360) as Rotation))
  }

  const rotateAllCCW = () => {
    setRotations(prev => prev.map(r => ((r - 90 + 360) % 360) as Rotation))
  }

  const resetAll = () => {
    setRotations(prev => prev.map(() => 0))
  }

  const handleSave = async () => {
    if (!file) return

    setSaving(true)
    try {
      const buffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(buffer)
      const pages = pdfDoc.getPages()

      pages.forEach((page, index) => {
        if (rotations[index] !== 0) {
          page.setRotation(degrees(rotations[index]))
        }
      })

      const result = await pdfDoc.save()
      const name = file.name.replace(".pdf", "-rotated.pdf")
      downloadBytes(result, name)
    } catch (e) {
      console.error("failed to rotate pdf", e)
    }
    setSaving(false)
  }

  const hasChanges = rotations.some(r => r !== 0)

  return (
    <div className="flex min-h-screen flex-col">
      <Toolbar title="rotate pdf" />

      <main className="container mx-auto flex-1 px-4 py-8">
        {!pdf ? (
          <div className="mx-auto max-w-2xl">
            <Dropzone onFiles={handleFile} accept=".pdf" />
            {loading && (
              <p className="mt-4 text-center text-muted-foreground">loading pdf...</p>
            )}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>upload a pdf to rotate pages 90, 180, or 270 degrees.</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-medium">{file?.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {thumbnails.length} pages
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={rotateAllCCW}>
                  <RotateCcw className="mr-1 h-4 w-4" />
                  rotate all left
                </Button>
                <Button variant="outline" size="sm" onClick={rotateAllCW}>
                  <RotateCw className="mr-1 h-4 w-4" />
                  rotate all right
                </Button>
                <Button variant="outline" size="sm" onClick={resetAll}>
                  reset
                </Button>
                <Button onClick={handleSave} disabled={!hasChanges || saving}>
                  <FileDown className="mr-2 h-4 w-4" />
                  {saving ? "saving..." : "save pdf"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {thumbnails.map((thumb, index) => (
                <div key={index} className="relative group rounded-lg border-2 border-border overflow-hidden">
                  <div className="relative">
                    <img
                      src={thumb}
                      alt={`Page ${index + 1}`}
                      className="w-full transition-transform duration-200"
                      style={{ transform: `rotate(${rotations[index]}deg)` }}
                      draggable={false}
                    />
                    {rotations[index] !== 0 && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">
                        {rotations[index]}°
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-background/80 backdrop-blur-sm py-1.5 flex items-center justify-center gap-2">
                    <button
                      onClick={() => rotatePageCCW(index)}
                      className="p-1 rounded hover:bg-muted transition-colors"
                      title="Rotate left"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium">{index + 1}</span>
                    <button
                      onClick={() => rotatePageCW(index)}
                      className="p-1 rounded hover:bg-muted transition-colors"
                      title="Rotate right"
                    >
                      <RotateCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null)
                  setPdf(null)
                  setThumbnails([])
                  setRotations([])
                }}
              >
                load different pdf
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
