"use client"

import { useState, useCallback } from "react"
import { Toolbar } from "@/components/layout/toolbar"
import { Dropzone } from "@/components/ui/dropzone"
import { Button } from "@/components/ui/button"
import { loadPdfForRender, type PDFDocumentProxy } from "@/lib/render"
import { downloadBytes } from "@/lib/download"
import { addRecentFile } from "@/components/layout/recent"
import { FileDown, Check } from "lucide-react"
import { PDFDocument } from "pdf-lib"

function parsePageRange(input: string, maxPages: number): Set<number> {
  const result = new Set<number>()
  const parts = input.split(",").map(p => p.trim()).filter(Boolean)

  for (const part of parts) {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map(n => parseInt(n.trim()))
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
          result.add(i - 1)
        }
      }
    } else {
      const num = parseInt(part)
      if (!isNaN(num) && num >= 1 && num <= maxPages) {
        result.add(num - 1)
      }
    }
  }

  return result
}

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null)
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [pageRangeInput, setPageRangeInput] = useState("")

  const handleFile = useCallback(async (files: File[]) => {
    const f = files[0]
    if (!f) return

    setLoading(true)
    setFile(f)
    setSelectedPages(new Set())

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
      addRecentFile({ name: f.name, size: f.size }, "split pdf", "/split")
    } catch (e) {
      console.error("failed to load pdf", e)
    }
    setLoading(false)
  }, [])

  const togglePage = (index: number) => {
    setSelectedPages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const selectAll = () => {
    setSelectedPages(new Set(thumbnails.map((_, i) => i)))
  }

  const selectNone = () => {
    setSelectedPages(new Set())
    setPageRangeInput("")
  }

  const applyPageRange = () => {
    const parsed = parsePageRange(pageRangeInput, thumbnails.length)
    setSelectedPages(parsed)
  }

  const handleExtract = async () => {
    if (!file || selectedPages.size === 0) return

    setExtracting(true)
    try {
      const buffer = await file.arrayBuffer()
      const srcPdf = await PDFDocument.load(buffer)
      const newPdf = await PDFDocument.create()

      const sortedPages = Array.from(selectedPages).sort((a, b) => a - b)
      const copiedPages = await newPdf.copyPages(srcPdf, sortedPages)
      for (const page of copiedPages) {
        newPdf.addPage(page)
      }

      const result = await newPdf.save()
      const name = file.name.replace(".pdf", `-pages-${sortedPages.map(p => p + 1).join("-")}.pdf`)
      downloadBytes(result, name)
    } catch (e) {
      console.error("failed to extract pages", e)
    }
    setExtracting(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Toolbar title="split pdf" />

      <main className="container mx-auto flex-1 px-4 py-8">
        {!pdf ? (
          <div className="mx-auto max-w-2xl">
            <Dropzone onFiles={handleFile} accept=".pdf" />
            {loading && (
              <p className="mt-4 text-center text-muted-foreground">loading pdf...</p>
            )}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>upload a pdf to extract specific pages into a new document.</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-medium">{file?.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {thumbnails.length} pages · {selectedPages.size} selected
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  select all
                </Button>
                <Button variant="outline" size="sm" onClick={selectNone}>
                  select none
                </Button>
                <Button
                  onClick={handleExtract}
                  disabled={selectedPages.size === 0 || extracting}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  {extracting ? "extracting..." : `extract ${selectedPages.size} page${selectedPages.size !== 1 ? "s" : ""}`}
                </Button>
              </div>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                <input
                  type="text"
                  value={pageRangeInput}
                  onChange={(e) => setPageRangeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyPageRange()}
                  placeholder="e.g. 1-5, 8, 10-12"
                  className="flex-1 sm:w-48 h-9 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button variant="outline" size="sm" onClick={applyPageRange}>
                  apply range
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                enter page numbers or ranges separated by commas
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {thumbnails.map((thumb, index) => (
                <button
                  key={index}
                  onClick={() => togglePage(index)}
                  className={`relative group rounded-lg border-2 overflow-hidden transition-all ${
                    selectedPages.has(index)
                      ? "border-blue-500 ring-2 ring-blue-500/20"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <img
                    src={thumb}
                    alt={`Page ${index + 1}`}
                    className="w-full"
                    draggable={false}
                  />
                  <div className={`absolute inset-0 transition-colors ${
                    selectedPages.has(index) ? "bg-blue-500/10" : "group-hover:bg-muted/50"
                  }`} />
                  {selectedPages.has(index) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-background/80 backdrop-blur-sm py-1 text-center text-sm font-medium">
                    {index + 1}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null)
                  setPdf(null)
                  setThumbnails([])
                  setSelectedPages(new Set())
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
