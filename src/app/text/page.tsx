"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Toolbar } from "@/components/layout/toolbar"
import { Dropzone } from "@/components/ui/dropzone"
import { Button } from "@/components/ui/button"
import { loadPdfForRender, renderPage, type PDFDocumentProxy } from "@/lib/render"
import { addContentToPdf } from "@/lib/pdf"
import { downloadBytes } from "@/lib/download"
import { ChevronLeft, ChevronRight, Plus, Trash2, Type, Image, X } from "lucide-react"

interface PageImage {
  id: string
  dataUrl: string
  x: number
  y: number
  width: number
  height: number
  pageIndex: number
}

interface PageText {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  pageIndex: number
}

export default function TextPage() {
  const [file, setFile] = useState<File | null>(null)
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [pageImages, setPageImages] = useState<string[]>([])
  const [images, setImages] = useState<PageImage[]>([])
  const [texts, setTexts] = useState<PageText[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ id: string; type: "image" | "text"; offsetX: number; offsetY: number } | null>(null)
  const [resizing, setResizing] = useState<{ id: string; startX: number; startY: number; startW: number; startH: number; corner: string; imgX: number; imgY: number } | null>(null)
  const [editingText, setEditingText] = useState<string | null>(null)
  const [fontSize, setFontSize] = useState(16)
  const editorRef = useRef<HTMLDivElement>(null)
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }>({ width: 612, height: 792 })

  const handleFile = useCallback(async (files: File[]) => {
    const f = files[0]
    if (!f) return

    setLoading(true)
    try {
      setFile(f)
      const loaded = await loadPdfForRender(f)
      setPdf(loaded)

      const rendered: string[] = []
      const extractedTexts: PageText[] = []

      for (let i = 1; i <= loaded.numPages; i++) {
        const page = await loaded.getPage(i)
        const viewport = page.getViewport({ scale: 1 })
        if (i === 1) {
          setPageDimensions({ width: viewport.width, height: viewport.height })
        }
        const canvas = document.createElement("canvas")
        const scale = 2
        canvas.width = viewport.width * scale
        canvas.height = viewport.height * scale
        canvas.style.width = `${viewport.width}px`
        canvas.style.height = `${viewport.height}px`
        const ctx = canvas.getContext("2d")!
        await page.render({
          canvasContext: ctx,
          viewport: page.getViewport({ scale }),
        }).promise
        rendered.push(canvas.toDataURL("image/png"))

        const textContent = await page.getTextContent()
        let currentLine = ""
        let lineX = 0
        let lineY = 0
        let lineHeight = 12
        let lastX = 0

        for (const item of textContent.items as Array<{ str: string; transform: number[]; height: number }>) {
          if (!item.str) continue
          const x = item.transform[4]
          const y = viewport.height - item.transform[5]
          const height = item.height || 12

          if (currentLine && (Math.abs(y - lineY) > height * 0.5 || x < lastX - 10)) {
            extractedTexts.push({
              id: Math.random().toString(36).slice(2),
              text: currentLine.trim(),
              x: lineX,
              y: lineY - lineHeight,
              fontSize: Math.round(lineHeight),
              pageIndex: i - 1,
            })
            currentLine = item.str
            lineX = x
            lineY = y
            lineHeight = height
          } else {
            if (!currentLine) {
              lineX = x
              lineY = y
              lineHeight = height
            }
            currentLine += item.str
          }
          lastX = x + (item.str.length * height * 0.5)
        }

        if (currentLine.trim()) {
          extractedTexts.push({
            id: Math.random().toString(36).slice(2),
            text: currentLine.trim(),
            x: lineX,
            y: lineY - lineHeight,
            fontSize: Math.round(lineHeight),
            pageIndex: i - 1,
          })
        }
      }

      setPageImages(rendered)
      setCurrentPage(0)
      setImages([])
      setTexts(extractedTexts)
    } catch (e) {
      console.error("failed to load pdf", e)
    }
    setLoading(false)
  }, [])

  const handleDownload = useCallback(async () => {
    if (!file) return

    setDownloading(true)
    try {
      const result = await addContentToPdf(file, texts, images, pageDimensions)
      const name = file.name.replace(".pdf", "-edited.pdf")
      downloadBytes(result, name)
    } catch (e) {
      console.error("failed to create pdf", e)
    }
    setDownloading(false)
  }, [file, texts, images, pageDimensions])

  const goToPrevious = () => setCurrentPage((p) => Math.max(0, p - 1))
  const goToNext = () => setCurrentPage((p) => Math.min(pageImages.length - 1, p + 1))

  const addText = () => {
    const id = Math.random().toString(36).slice(2)
    const newText: PageText = {
      id,
      text: "",
      x: 50,
      y: 50,
      fontSize,
      pageIndex: currentPage,
    }
    setTexts((prev) => [...prev, newText])
    setSelectedItem(id)
    setEditingText(id)
  }

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault()
        const f = item.getAsFile()
        if (!f) continue

        const reader = new FileReader()
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string
          const img = new window.Image()
          img.onload = () => {
            const maxWidth = 300
            const scale = img.width > maxWidth ? maxWidth / img.width : 1
            setImages((prev) => [
              ...prev,
              {
                id: Math.random().toString(36).slice(2),
                dataUrl,
                x: 50,
                y: 50,
                width: img.width * scale,
                height: img.height * scale,
                pageIndex: currentPage,
              },
            ])
          }
          img.src = dataUrl
        }
        reader.readAsDataURL(f)
        break
      }
    }
  }, [currentPage])

  useEffect(() => {
    window.addEventListener("paste", handlePaste)
    return () => window.removeEventListener("paste", handlePaste)
  }, [handlePaste])

  const handleItemMouseDown = (e: React.MouseEvent, id: string, type: "image" | "text") => {
    if (editingText === id) return
    e.preventDefault()
    e.stopPropagation()
    setSelectedItem(id)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setDragging({
      id,
      type,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    })
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (resizing) {
      const dx = e.clientX - resizing.startX
      const aspectRatio = resizing.startW / resizing.startH

      let newW = resizing.startW
      let newH = resizing.startH
      let newX = resizing.imgX
      let newY = resizing.imgY

      if (resizing.corner === "br") {
        newW = Math.max(30, resizing.startW + dx)
        newH = newW / aspectRatio
      } else if (resizing.corner === "bl") {
        newW = Math.max(30, resizing.startW - dx)
        newH = newW / aspectRatio
        newX = resizing.imgX + (resizing.startW - newW)
      } else if (resizing.corner === "tr") {
        newW = Math.max(30, resizing.startW + dx)
        newH = newW / aspectRatio
        newY = resizing.imgY + (resizing.startH - newH)
      } else if (resizing.corner === "tl") {
        newW = Math.max(30, resizing.startW - dx)
        newH = newW / aspectRatio
        newX = resizing.imgX + (resizing.startW - newW)
        newY = resizing.imgY + (resizing.startH - newH)
      }

      setImages((prev) =>
        prev.map((img) =>
          img.id === resizing.id
            ? { ...img, width: newW, height: newH, x: newX, y: newY }
            : img
        )
      )
      return
    }

    if (!dragging || !editorRef.current) return

    const rect = editorRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - dragging.offsetX
    const y = e.clientY - rect.top - dragging.offsetY

    if (dragging.type === "image") {
      setImages((prev) =>
        prev.map((img) =>
          img.id === dragging.id
            ? { ...img, x: Math.max(0, x), y: Math.max(0, y) }
            : img
        )
      )
    } else {
      setTexts((prev) =>
        prev.map((t) =>
          t.id === dragging.id
            ? { ...t, x: Math.max(0, x), y: Math.max(0, y) }
            : t
        )
      )
    }
  }, [dragging, resizing])

  const handleMouseUp = useCallback(() => {
    setDragging(null)
    setResizing(null)
  }, [])

  useEffect(() => {
    if (dragging || resizing) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [dragging, resizing, handleMouseMove, handleMouseUp])

  const deleteItem = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
    setTexts((prev) => prev.filter((t) => t.id !== id))
    setSelectedItem(null)
  }

  const handleTextDoubleClick = (id: string) => {
    setEditingText(id)
    setSelectedItem(id)
  }

  const handleTextBlur = (id: string, newText: string) => {
    setTexts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: newText } : t))
    )
    setEditingText(null)
  }

  const currentImages = images.filter((img) => img.pageIndex === currentPage)
  const currentTexts = texts.filter((t) => t.pageIndex === currentPage)
  const hasContent = images.length > 0 || texts.length > 0

  return (
    <div className="flex min-h-screen flex-col">
      <Toolbar
        title="edit pdf"
        onDownload={handleDownload}
        downloading={downloading}
        downloadDisabled={!file}
      />

      <main className="flex flex-1 flex-col">
        {!pdf ? (
          <div className="container mx-auto flex-1 px-4 py-8">
            <Dropzone
              onFiles={handleFile}
              accept=".pdf"
              className="mx-auto max-w-2xl"
            />
            {loading && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                loading pdf...
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-1 min-h-0">
            <div className="flex flex-1 flex-col min-h-0">
              <div className="flex items-center justify-between border-b px-4 py-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToPrevious}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    page {currentPage + 1} of {pageImages.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToNext}
                    disabled={currentPage === pageImages.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={addText} title="add text">
                    <Type className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-auto bg-muted/50 p-4">
                <div className="mx-auto w-fit">
                  <div
                    ref={editorRef}
                    className="relative shadow-lg"
                    style={{ width: pageDimensions.width, height: pageDimensions.height }}
                    onClick={() => {
                      setSelectedItem(null)
                      setEditingText(null)
                    }}
                  >
                    {pageImages[currentPage] && (
                      <img
                        src={pageImages[currentPage]}
                        alt={`page ${currentPage + 1}`}
                        className="pointer-events-none absolute inset-0 h-full w-full"
                        draggable={false}
                      />
                    )}

                    {currentTexts.map((t) => (
                      <div
                        key={t.id}
                        className={`absolute z-10 cursor-move ${selectedItem === t.id ? "ring-2 ring-primary" : ""}`}
                        style={{ left: t.x, top: t.y }}
                        onMouseDown={(e) => handleItemMouseDown(e, t.id, "text")}
                        onDoubleClick={() => handleTextDoubleClick(t.id)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {editingText === t.id ? (
                          <input
                            type="text"
                            defaultValue={t.text}
                            autoFocus
                            className="border-none bg-yellow-100 px-2 py-0.5 text-black outline-none"
                            style={{ fontSize: t.fontSize }}
                            onBlur={(e) => handleTextBlur(t.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleTextBlur(t.id, e.currentTarget.value)
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span
                            className="whitespace-nowrap rounded bg-yellow-100 px-2 py-0.5 shadow-sm"
                            style={{ fontSize: t.fontSize, color: t.text ? "#000" : "#999" }}
                          >
                            {t.text || "double click to edit"}
                          </span>
                        )}
                        {selectedItem === t.id && !editingText && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteItem(t.id)
                            }}
                            className="absolute -right-2 -top-2 z-10 rounded-full bg-destructive p-1 text-white shadow-md hover:bg-destructive/80"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}

                    {currentImages.map((img) => (
                      <div
                        key={img.id}
                        className={`absolute z-10 cursor-move ${selectedItem === img.id ? "ring-2 ring-primary" : ""}`}
                        style={{
                          left: img.x,
                          top: img.y,
                          width: img.width,
                          height: img.height,
                        }}
                        onMouseDown={(e) => handleItemMouseDown(e, img.id, "image")}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img
                          src={img.dataUrl}
                          alt="pasted"
                          className="h-full w-full object-contain pointer-events-none"
                          draggable={false}
                        />
                        {selectedItem === img.id && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteItem(img.id)
                              }}
                              className="absolute -right-2 -top-2 z-10 rounded-full bg-destructive p-1 text-white shadow-md hover:bg-destructive/80"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            {["tl", "tr", "bl", "br"].map((corner) => (
                              <div
                                key={corner}
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setResizing({ id: img.id, startX: e.clientX, startY: e.clientY, startW: img.width, startH: img.height, corner, imgX: img.x, imgY: img.y })
                                }}
                                className={`absolute h-2.5 w-2.5 rounded-full border-2 border-primary bg-white shadow ${
                                  corner === "tl" ? "-left-1.5 -top-1.5 cursor-nw-resize" :
                                  corner === "tr" ? "-right-1.5 -top-1.5 cursor-ne-resize" :
                                  corner === "bl" ? "-bottom-1.5 -left-1.5 cursor-sw-resize" :
                                  "-bottom-1.5 -right-1.5 cursor-se-resize"
                                }`}
                              />
                            ))}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <aside className="w-64 border-l bg-background p-4">
              <h2 className="font-medium">add content</h2>

              <div className="mt-4 space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={addText}>
                  <Type className="mr-2 h-4 w-4" />
                  add text
                </Button>
                <p className="text-xs text-muted-foreground">
                  <Image className="inline h-3 w-3 mr-1" />
                  paste images with ctrl+v
                </p>
              </div>

              <div className="mt-6 pt-4 border-t">
                <label className="text-sm text-muted-foreground">text size</label>
                <input
                  type="range"
                  min="10"
                  max="48"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="mt-1 w-full"
                />
                <span className="text-sm">{fontSize}px</span>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {currentTexts.length} text{currentTexts.length !== 1 ? "s" : ""}, {currentImages.length} image{currentImages.length !== 1 ? "s" : ""} on this page
                </p>
              </div>

              <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                <p>• click to select</p>
                <p>• drag to move</p>
                <p>• double-click text to edit</p>
                <p>• corner handles to resize images</p>
              </div>

              <div className="mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setFile(null)
                    setPdf(null)
                    setPageImages([])
                    setImages([])
                    setTexts([])
                    setCurrentPage(0)
                  }}
                >
                  start over
                </Button>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
