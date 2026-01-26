"use client"

import { useState, useCallback } from "react"
import { Toolbar } from "@/components/layout/toolbar"
import { Dropzone } from "@/components/ui/dropzone"
import { Button } from "@/components/ui/button"
import { loadPdf } from "@/lib/pdf"
import { downloadBytes } from "@/lib/download"
import { addRecentFile } from "@/components/layout/recent"
import { FileDown } from "lucide-react"
import { rgb, StandardFonts } from "pdf-lib"

type Position = "bottom-center" | "bottom-left" | "bottom-right" | "top-center" | "top-left" | "top-right"

export default function PageNumbersPage() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [position, setPosition] = useState<Position>("bottom-center")
  const [format, setFormat] = useState("Page {n} of {total}")
  const [fontSize, setFontSize] = useState(12)
  const [startFrom, setStartFrom] = useState(1)
  const [margin, setMargin] = useState(30)

  const handleFile = useCallback(async (files: File[]) => {
    const f = files[0]
    if (!f) return

    setLoading(true)
    try {
      setFile(f)
      const pdf = await loadPdf(f)
      setPageCount(pdf.getPageCount())
      addRecentFile({ name: f.name, size: f.size }, "page numbers", "/pagenumbers")
    } catch (e) {
      console.error("failed to load pdf", e)
    }
    setLoading(false)
  }, [])

  const handleAddPageNumbers = async () => {
    if (!file) return

    setProcessing(true)
    try {
      const pdf = await loadPdf(file)
      const font = await pdf.embedFont(StandardFonts.Helvetica)
      const pages = pdf.getPages()
      const total = pages.length

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        const { width, height } = page.getSize()
        const pageNum = i + startFrom

        const text = format
          .replace("{n}", String(pageNum))
          .replace("{total}", String(total + startFrom - 1))

        const textWidth = font.widthOfTextAtSize(text, fontSize)

        let x: number
        let y: number

        switch (position) {
          case "bottom-left":
            x = margin
            y = margin
            break
          case "bottom-center":
            x = (width - textWidth) / 2
            y = margin
            break
          case "bottom-right":
            x = width - textWidth - margin
            y = margin
            break
          case "top-left":
            x = margin
            y = height - margin - fontSize
            break
          case "top-center":
            x = (width - textWidth) / 2
            y = height - margin - fontSize
            break
          case "top-right":
            x = width - textWidth - margin
            y = height - margin - fontSize
            break
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        })
      }

      const result = await pdf.save()
      const name = file.name.replace(".pdf", "-numbered.pdf")
      downloadBytes(result, name)
    } catch (e) {
      console.error("failed to add page numbers", e)
    }
    setProcessing(false)
  }

  const positions: { value: Position; label: string }[] = [
    { value: "bottom-left", label: "bottom left" },
    { value: "bottom-center", label: "bottom center" },
    { value: "bottom-right", label: "bottom right" },
    { value: "top-left", label: "top left" },
    { value: "top-center", label: "top center" },
    { value: "top-right", label: "top right" },
  ]

  const formats = [
    "Page {n} of {total}",
    "{n} / {total}",
    "{n}",
    "- {n} -",
    "Page {n}",
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Toolbar title="add page numbers" />

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-xl">
          {!file ? (
            <>
              <Dropzone onFiles={handleFile} accept=".pdf" />
              {loading && (
                <p className="mt-4 text-center text-muted-foreground">loading...</p>
              )}
              <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>upload a pdf to add page numbers.</p>
              </div>
            </>
          ) : (
            <div className="rounded-lg border p-6">
              <h2 className="font-medium mb-1">{file.name}</h2>
              <p className="text-sm text-muted-foreground mb-6">{pageCount} pages</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">position</label>
                  <div className="grid grid-cols-3 gap-2">
                    {positions.map((pos) => (
                      <button
                        key={pos.value}
                        onClick={() => setPosition(pos.value)}
                        className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                          position === pos.value
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {formats.map((f) => (
                      <option key={f} value={f}>
                        {f.replace("{n}", "1").replace("{total}", String(pageCount))}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">font size</label>
                    <input
                      type="number"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      min={8}
                      max={24}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">start from</label>
                    <input
                      type="number"
                      value={startFrom}
                      onChange={(e) => setStartFrom(Number(e.target.value))}
                      min={0}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">margin</label>
                    <input
                      type="number"
                      value={margin}
                      onChange={(e) => setMargin(Number(e.target.value))}
                      min={10}
                      max={100}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">preview</p>
                  <p className="font-medium">
                    {format.replace("{n}", String(startFrom)).replace("{total}", String(pageCount + startFrom - 1))}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null)
                    setPageCount(0)
                  }}
                  className="flex-1"
                >
                  load different pdf
                </Button>
                <Button
                  onClick={handleAddPageNumbers}
                  disabled={processing}
                  className="flex-1 gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  {processing ? "processing..." : "download"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
