"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Toolbar } from "@/components/layout/toolbar"
import { Dropzone } from "@/components/ui/dropzone"
import { Button } from "@/components/ui/button"
import { loadPdfForRender, type PDFDocumentProxy } from "@/lib/render"
import { editPdfText } from "@/lib/pdf"
import { downloadBytes } from "@/lib/download"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface TextItem {
  id: string
  str: string
  originalStr: string
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  pageIndex: number
  transform: number[]
  edited: boolean
  fontWeight: "normal" | "bold"
  fontStyle: "normal" | "italic"
  fontName: string
}

export default function TextPage() {
  const [file, setFile] = useState<File | null>(null)
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [pageCanvases, setPageCanvases] = useState<string[]>([])
  const [textItems, setTextItems] = useState<TextItem[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [pageDimensions, setPageDimensions] = useState({ width: 612, height: 792 })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [scale, setScale] = useState(1.5)
  const editorRef = useRef<HTMLDivElement>(null)

  const handleFile = useCallback(async (files: File[]) => {
    const f = files[0]
    if (!f) return

    setLoading(true)
    try {
      setFile(f)
      const loaded = await loadPdfForRender(f)
      setPdf(loaded)

      const canvases: string[] = []
      const allTextItems: TextItem[] = []

      for (let i = 1; i <= loaded.numPages; i++) {
        const page = await loaded.getPage(i)
        const viewport = page.getViewport({ scale })

        if (i === 1) {
          setPageDimensions({ width: viewport.width, height: viewport.height })
        }

        const canvas = document.createElement("canvas")
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext("2d")!
        await page.render({ canvasContext: ctx, viewport }).promise
        canvases.push(canvas.toDataURL("image/png"))

        const textContent = await page.getTextContent()

        for (const item of textContent.items as any[]) {
          if (!item.str || !item.str.trim()) continue

          const tx = item.transform
          const x = tx[4] * scale
          const y = viewport.height - tx[5] * scale
          const fontSize = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]) * scale
          const width = item.width * scale
          const height = fontSize * 1.2

          const fontName = item.fontName || ""
          const fontNameLower = fontName.toLowerCase()
          const isBold = fontNameLower.includes("bold") || fontNameLower.includes("black") || fontNameLower.includes("heavy")
          const isItalic = fontNameLower.includes("italic") || fontNameLower.includes("oblique")

          allTextItems.push({
            id: `${i - 1}-${allTextItems.length}`,
            str: item.str,
            originalStr: item.str,
            x,
            y: y - fontSize,
            width: Math.max(width, fontSize * item.str.length * 0.6),
            height,
            fontSize,
            pageIndex: i - 1,
            transform: tx,
            edited: false,
            fontWeight: isBold ? "bold" : "normal",
            fontStyle: isItalic ? "italic" : "normal",
            fontName,
          })
        }
      }

      setPageCanvases(canvases)
      setTextItems(allTextItems)
      setCurrentPage(0)
    } catch (e) {
      console.error("failed to load pdf", e)
    }
    setLoading(false)
  }, [scale])

  const handleTextChange = (id: string, newText: string) => {
    setTextItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, str: newText, edited: newText !== item.originalStr }
          : item
      )
    )
  }

  const handleDownload = useCallback(async () => {
    if (!file) return

    setDownloading(true)
    try {
      const editedItems = textItems.filter((item) => item.edited)
      const result = await editPdfText(file, editedItems, scale)
      const name = file.name.replace(".pdf", "-edited.pdf")
      downloadBytes(result, name)
    } catch (e) {
      console.error("failed to save pdf", e)
    }
    setDownloading(false)
  }, [file, textItems, scale])

  const currentPageItems = textItems.filter((item) => item.pageIndex === currentPage && !(item.edited && item.str === ""))
  const hasEdits = textItems.some((item) => item.edited)

  return (
    <div className="flex min-h-screen flex-col">
      <Toolbar
        title="edit pdf"
        onDownload={handleDownload}
        downloading={downloading}
        downloadDisabled={!file || !hasEdits}
      />

      <main className="flex flex-1 flex-col">
        {!pdf ? (
          <div className="container mx-auto flex-1 px-4 py-8">
            <Dropzone onFiles={handleFile} accept=".pdf" className="mx-auto max-w-2xl" />
            {loading && <p className="mt-4 text-center text-muted-foreground">loading pdf...</p>}
            <div className="mt-8 mx-auto max-w-xl text-center text-sm text-muted-foreground">
              <p>upload a pdf to edit its text directly.</p>
              <p className="mt-2">click on any text to edit it in place.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 min-h-0">
            <div className="flex flex-1 flex-col min-h-0">
              <div className="flex items-center justify-center gap-4 border-b px-4 py-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  page {currentPage + 1} of {pageCanvases.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(pageCanvases.length - 1, p + 1))}
                  disabled={currentPage === pageCanvases.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-auto bg-muted/50 p-4">
                <div className="mx-auto w-fit">
                  <div
                    ref={editorRef}
                    className="relative bg-white shadow-lg"
                    style={{ width: pageDimensions.width, height: pageDimensions.height }}
                  >
                    {pageCanvases[currentPage] && (
                      <img
                        src={pageCanvases[currentPage]}
                        alt={`page ${currentPage + 1}`}
                        className="absolute inset-0 h-full w-full"
                        draggable={false}
                      />
                    )}

                    <div className="absolute inset-0">
                      {currentPageItems.map((item) => (
                        <div
                          key={item.id}
                          className="absolute"
                          style={{
                            left: item.x,
                            top: item.y,
                            minWidth: item.width,
                            height: item.height,
                          }}
                        >
                          {editingId === item.id ? (
                            <input
                              type="text"
                              value={item.str}
                              onChange={(e) => handleTextChange(item.id, e.target.value)}
                              onBlur={() => setEditingId(null)}
                              onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
                              autoFocus
                              className="w-full border-2 border-blue-500 bg-white outline-none"
                              style={{
                                fontSize: item.fontSize * 0.98,
                                lineHeight: `${item.height}px`,
                                height: item.height,
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontWeight: item.fontWeight,
                                fontStyle: item.fontStyle,
                                color: "#000",
                                letterSpacing: "-0.01em",
                                padding: 0,
                              }}
                            />
                          ) : (
                            <div
                              onClick={() => setEditingId(item.id)}
                              className={`cursor-text hover:bg-blue-100/30 ${
                                item.edited ? "bg-white" : ""
                              }`}
                              style={{
                                fontSize: item.fontSize * 0.98,
                                lineHeight: `${item.height}px`,
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontWeight: item.fontWeight,
                                fontStyle: item.fontStyle,
                                color: item.edited ? "#000" : "transparent",
                                whiteSpace: "nowrap",
                                letterSpacing: "-0.01em",
                              }}
                            >
                              {item.str}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="w-64 border-l bg-background p-4">
              <h2 className="font-medium">edit pdf</h2>

              <div className="mt-4 text-sm text-muted-foreground space-y-2">
                <p>• click any text to edit</p>
                <p>• press enter or click away to confirm</p>
                <p>• edited text shows yellow highlight</p>
              </div>

              <div className="mt-6 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {currentPageItems.length} text elements
                </p>
                <p className="text-sm text-muted-foreground">
                  {textItems.filter((t) => t.edited).length} edited
                </p>
              </div>

              <div className="mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setTextItems((prev) =>
                      prev.map((item) => ({ ...item, str: item.originalStr, edited: false }))
                    )
                  }}
                >
                  reset all changes
                </Button>
              </div>

              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setFile(null)
                    setPdf(null)
                    setPageCanvases([])
                    setTextItems([])
                  }}
                >
                  load different pdf
                </Button>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
