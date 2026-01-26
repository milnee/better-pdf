"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Toolbar } from "@/components/layout/toolbar"
import { Dropzone } from "@/components/ui/dropzone"
import { Button } from "@/components/ui/button"
import { loadPdfForRender, type PDFDocumentProxy } from "@/lib/render"
import { editPdfText } from "@/lib/pdf"
import { downloadBytes } from "@/lib/download"
import { addRecentFile } from "@/components/layout/recent"
import { ChevronLeft, ChevronRight, Bold, Italic, Underline, Undo2, Redo2, Plus, Type, PenTool, Highlighter, X, Check, Trash2, MousePointer, Image, AlignLeft, AlignCenter, AlignRight, RotateCw, Trash, GripVertical, PanelLeftClose, PanelLeft } from "lucide-react"

type EditorTool = "select" | "text" | "sign" | "image"

interface SignatureItem {
  id: string
  dataUrl: string
  x: number
  y: number
  width: number
  height: number
  pageIndex: number
}

interface ImageItem {
  id: string
  dataUrl: string
  x: number
  y: number
  width: number
  height: number
  pageIndex: number
}

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
  pdfX: number
  pdfY: number
  pdfFontSize: number
  pdfWidth: number
  isNew?: boolean
  color?: string
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
  const [scale, setScale] = useState(2)
  const [history, setHistory] = useState<TextItem[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [addTextMode, setAddTextMode] = useState(false)
  const [selectedColor, setSelectedColor] = useState("#000000")
  const [selectedFont, setSelectedFont] = useState("Helvetica")
  const [selectedFontSize, setSelectedFontSize] = useState(12)
  const [currentTool, setCurrentTool] = useState<EditorTool>("select")
  const [signatures, setSignatures] = useState<SignatureItem[]>([])
  const [showSignPad, setShowSignPad] = useState(false)
  const [selectedSignature, setSelectedSignature] = useState<string | null>(null)
  const [draggingSignature, setDraggingSignature] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [resizingSignature, setResizingSignature] = useState<string | null>(null)
  const [resizeCorner, setResizeCorner] = useState<"tl" | "tr" | "bl" | "br" | null>(null)
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number; sigX: number; sigY: number } | null>(null)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)
  const [images, setImages] = useState<ImageItem[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [draggingImage, setDraggingImage] = useState<string | null>(null)
  const [resizingImage, setResizingImage] = useState<string | null>(null)
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({})
  const [deletedPages, setDeletedPages] = useState<Set<number>>(new Set())
  const [pageThumbnails, setPageThumbnails] = useState<string[]>([])
  const [pageOrder, setPageOrder] = useState<number[]>([])
  const [showThumbnails, setShowThumbnails] = useState(true)
  const [draggedPage, setDraggedPage] = useState<number | null>(null)
  const [dragOverPage, setDragOverPage] = useState<number | null>(null)
  const [isDroppingImage, setIsDroppingImage] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const signCanvasRef = useRef<HTMLCanvasElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const isDrawingSignature = useRef(false)

  const fonts = [
    "Helvetica",
    "Times New Roman",
    "Courier",
    "Arial",
    "Georgia",
    "Verdana",
  ]

  const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72]

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

      const dpr = window.devicePixelRatio || 1

      for (let i = 1; i <= loaded.numPages; i++) {
        const page = await loaded.getPage(i)
        const viewport = page.getViewport({ scale })
        const renderViewport = page.getViewport({ scale: scale * dpr })

        if (i === 1) {
          setPageDimensions({ width: viewport.width, height: viewport.height })
        }

        const canvas = document.createElement("canvas")
        canvas.width = renderViewport.width
        canvas.height = renderViewport.height
        const ctx = canvas.getContext("2d")!
        await page.render({ canvasContext: ctx, viewport: renderViewport }).promise
        canvases.push(canvas.toDataURL("image/png", 1.0))

        const textContent = await page.getTextContent()
        const styles = (textContent as any).styles || {}

        const rawItems: any[] = []
        for (const item of textContent.items as any[]) {
          if (!item.str || !item.str.trim()) continue
          const style = styles[item.fontName] || {}
          rawItems.push({
            ...item,
            isBold: style.fontFamily?.toLowerCase().includes("bold") ||
                    item.fontName?.toLowerCase().includes("bold") ||
                    item.fontName?.toLowerCase().includes("black") ||
                    item.fontName?.toLowerCase().includes("heavy") ||
                    style.fontWeight >= 700,
            isItalic: style.fontFamily?.toLowerCase().includes("italic") ||
                      style.fontFamily?.toLowerCase().includes("oblique") ||
                      item.fontName?.toLowerCase().includes("italic") ||
                      item.fontName?.toLowerCase().includes("oblique"),
          })
        }

        rawItems.sort((a, b) => {
          const yDiff = b.transform[5] - a.transform[5]
          if (Math.abs(yDiff) > 2) return yDiff
          return a.transform[4] - b.transform[4]
        })

        const lineMap = new Map<number, any[]>()
        for (const item of rawItems) {
          const pdfY = Math.round(item.transform[5])
          let foundLine = false
          for (const [lineY, items] of lineMap) {
            if (Math.abs(lineY - pdfY) < 3) {
              items.push(item)
              foundLine = true
              break
            }
          }
          if (!foundLine) {
            lineMap.set(pdfY, [item])
          }
        }

        const mergedItems: any[] = []
        for (const [lineY, items] of lineMap) {
          items.sort((a, b) => a.transform[4] - b.transform[4])

          const first = items[0]
          const last = items[items.length - 1]
          const pdfX = first.transform[4]
          const endX = last.transform[4] + last.width

          let fullText = ""
          for (let j = 0; j < items.length; j++) {
            const curr = items[j]
            const prev = items[j - 1]

            if (prev) {
              const prevEndX = prev.transform[4] + prev.width
              const currStartX = curr.transform[4]
              const gap = currStartX - prevEndX
              const fontSize = Math.sqrt(curr.transform[0] ** 2 + curr.transform[1] ** 2)
              const spaceWidth = fontSize * 0.25

              if (gap > spaceWidth) {
                fullText += " "
              }
            }

            let text = curr.str
            if (curr.isBold && curr.isItalic) {
              text = `<b><i>${text}</i></b>`
            } else if (curr.isBold) {
              text = `<b>${text}</b>`
            } else if (curr.isItalic) {
              text = `<i>${text}</i>`
            }

            fullText += text
          }

          const firstFontSize = Math.sqrt(first.transform[0] ** 2 + first.transform[1] ** 2)

          mergedItems.push({
            str: fullText,
            transform: first.transform,
            width: endX - pdfX,
            fontName: first.fontName,
            pdfFontSize: firstFontSize,
          })
        }

        mergedItems.sort((a, b) => b.transform[5] - a.transform[5])

        for (const item of mergedItems) {
          const tx = item.transform
          const pdfFontSize = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1])
          const pdfX = tx[4]
          const pdfY = tx[5]
          const pdfWidth = item.width

          const fontSize = pdfFontSize * scale
          const x = pdfX * scale
          const y = viewport.height - (pdfY * scale) - fontSize * 0.85
          const width = pdfWidth * scale
          const height = fontSize * 1.1

          const fontName = item.fontName || ""
          const fontNameLower = fontName.toLowerCase()
          const isBold = fontNameLower.includes("bold") || fontNameLower.includes("black") || fontNameLower.includes("heavy")
          const isItalic = fontNameLower.includes("italic") || fontNameLower.includes("oblique")

          allTextItems.push({
            id: `${i - 1}-${allTextItems.length}`,
            str: item.str,
            originalStr: item.str,
            x,
            y,
            width: Math.max(width, fontSize * item.str.length * 0.5),
            height,
            fontSize,
            pageIndex: i - 1,
            transform: tx,
            edited: false,
            fontWeight: isBold ? "bold" : "normal",
            fontStyle: isItalic ? "italic" : "normal",
            fontName,
            pdfX,
            pdfY,
            pdfFontSize,
            pdfWidth,
          })
        }
      }

      setPageCanvases(canvases)
      setTextItems(allTextItems)
      setCurrentPage(0)
      setPageOrder(Array.from({ length: loaded.numPages }, (_, i) => i))

      const thumbs: string[] = []
      for (let i = 1; i <= loaded.numPages; i++) {
        const page = await loaded.getPage(i)
        const thumbViewport = page.getViewport({ scale: 0.2 })
        const thumbCanvas = document.createElement("canvas")
        thumbCanvas.width = thumbViewport.width
        thumbCanvas.height = thumbViewport.height
        const thumbCtx = thumbCanvas.getContext("2d")!
        await page.render({ canvasContext: thumbCtx, viewport: thumbViewport }).promise
        thumbs.push(thumbCanvas.toDataURL("image/png"))
      }
      setPageThumbnails(thumbs)

      addRecentFile({ name: f.name, size: f.size }, "edit pdf", "/text")
    } catch (e) {
      console.error("failed to load pdf", e)
    }
    setLoading(false)
  }, [scale])

  const saveToHistory = useCallback((items: TextItem[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(JSON.parse(JSON.stringify(items)))
      return newHistory.slice(-50)
    })
    setHistoryIndex(prev => Math.min(prev + 1, 49))
  }, [historyIndex])

  const handleTextChange = (id: string, newText: string) => {
    setTextItems((prev) => {
      const newItems = prev.map((item) =>
        item.id === id
          ? { ...item, str: newText, edited: true }
          : item
      )
      return newItems
    })
  }

  const commitChange = () => {
    saveToHistory(textItems)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1)
      setTextItems(JSON.parse(JSON.stringify(history[historyIndex - 1])))
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1)
      setTextItems(JSON.parse(JSON.stringify(history[historyIndex + 1])))
    }
  }

  const applyBold = () => {
    document.execCommand("bold", false)
  }

  const applyItalic = () => {
    document.execCommand("italic", false)
  }

  const applyUnderline = () => {
    document.execCommand("underline", false)
  }

  const applyColor = (color: string) => {
    document.execCommand("foreColor", false, color)
    setSelectedColor(color)
  }

  const applyFont = (font: string) => {
    document.execCommand("fontName", false, font)
    setSelectedFont(font)
  }

  const applyFontSize = (size: number) => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      if (!range.collapsed) {
        const span = document.createElement("span")
        span.style.fontSize = `${size}px`
        range.surroundContents(span)
      }
    }
    setSelectedFontSize(size)
  }

  const applyTextHighlight = (color: string) => {
    document.execCommand("hiliteColor", false, color)
  }

  const textHighlightColors = [
    { color: "#ffff00", name: "Yellow" },
    { color: "#00ff00", name: "Green" },
    { color: "#00ffff", name: "Cyan" },
    { color: "#ff69b4", name: "Pink" },
    { color: "#ffa500", name: "Orange" },
  ]

  const applyAlignment = (align: "left" | "center" | "right") => {
    document.execCommand("justify" + align.charAt(0).toUpperCase() + align.slice(1), false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      const img = document.createElement("img")
      img.onload = () => {
        const maxWidth = 200
        const ratio = img.width / img.height
        const width = Math.min(img.width, maxWidth)
        const height = width / ratio
        const newImage: ImageItem = {
          id: `img-${Date.now()}`,
          dataUrl,
          x: pageDimensions.width / 2 - width / 2,
          y: pageDimensions.height / 2 - height / 2,
          width,
          height,
          pageIndex: currentPage,
        }
        setImages(prev => [...prev, newImage])
        setSelectedImage(newImage.id)
        setCurrentTool("select")
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const deleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
    setSelectedImage(null)
  }

  const rotatePage = (pageIndex: number) => {
    setPageRotations(prev => ({
      ...prev,
      [pageIndex]: ((prev[pageIndex] || 0) + 90) % 360
    }))
  }

  const deletePage = (pageIndex: number) => {
    setDeletedPages(prev => {
      const newSet = new Set(prev)
      newSet.add(pageIndex)
      return newSet
    })
    if (currentPage === pageIndex) {
      const availablePages = Array.from({ length: pageCanvases.length }, (_, i) => i)
        .filter(i => !deletedPages.has(i) && i !== pageIndex)
      if (availablePages.length > 0) {
        setCurrentPage(availablePages[0])
      }
    }
  }

  const restorePage = (pageIndex: number) => {
    setDeletedPages(prev => {
      const newSet = new Set(prev)
      newSet.delete(pageIndex)
      return newSet
    })
  }

  const handlePageDragStart = (index: number) => {
    setDraggedPage(index)
  }

  const handlePageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverPage(index)
  }

  const handlePageDrop = (targetIndex: number) => {
    if (draggedPage === null || draggedPage === targetIndex) {
      setDraggedPage(null)
      setDragOverPage(null)
      return
    }
    setPageOrder(prev => {
      const newOrder = [...prev]
      const draggedItem = newOrder[draggedPage]
      newOrder.splice(draggedPage, 1)
      newOrder.splice(targetIndex, 0, draggedItem)
      return newOrder
    })
    setDraggedPage(null)
    setDragOverPage(null)
  }

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDroppingImage(false)
    const files = e.dataTransfer.files
    if (files.length === 0) return
    const file = files[0]
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      const img = document.createElement("img")
      img.onload = () => {
        const maxWidth = 200
        const ratio = img.width / img.height
        const width = Math.min(img.width, maxWidth)
        const height = width / ratio
        const rect = editorRef.current?.getBoundingClientRect()
        const dropX = rect ? e.clientX - rect.left - width / 2 : pageDimensions.width / 2 - width / 2
        const dropY = rect ? e.clientY - rect.top - height / 2 : pageDimensions.height / 2 - height / 2
        const newImage: ImageItem = {
          id: `img-${Date.now()}`,
          dataUrl,
          x: Math.max(0, Math.min(dropX, pageDimensions.width - width)),
          y: Math.max(0, Math.min(dropY, pageDimensions.height - height)),
          width,
          height,
          pageIndex: currentPage,
        }
        setImages(prev => [...prev, newImage])
        setSelectedImage(newImage.id)
        setCurrentTool("select")
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }

  const handleEditorDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.types.includes("Files")) {
      setIsDroppingImage(true)
    }
  }

  const handleEditorDragLeave = () => {
    setIsDroppingImage(false)
  }

  const startDraggingImage = (e: React.MouseEvent, imgId: string) => {
    if (currentTool !== "select") return
    e.preventDefault()
    e.stopPropagation()
    const img = images.find(i => i.id === imgId)
    if (!img || !editorRef.current) return
    const rect = editorRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    setDraggingImage(imgId)
    setSelectedImage(imgId)
    setDragOffset({ x: mouseX - img.x, y: mouseY - img.y })
  }

  const startResizingImage = (e: React.MouseEvent, imgId: string, corner: "tl" | "tr" | "bl" | "br") => {
    e.preventDefault()
    e.stopPropagation()
    const img = images.find(i => i.id === imgId)
    if (!img || !editorRef.current) return
    const rect = editorRef.current.getBoundingClientRect()
    setResizingImage(imgId)
    setResizeCorner(corner)
    setResizeStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      width: img.width,
      height: img.height,
      sigX: img.x,
      sigY: img.y,
    })
  }

  const addNewText = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!addTextMode || !editorRef.current) return

    const rect = editorRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newId = `new-${Date.now()}`
    const fontSize = 16 * scale
    const pdfFontSize = 16

    const newItem: TextItem = {
      id: newId,
      str: "New text",
      originalStr: "",
      x,
      y,
      width: 100,
      height: fontSize * 1.1,
      fontSize,
      pageIndex: currentPage,
      transform: [pdfFontSize, 0, 0, pdfFontSize, x / scale, (pageDimensions.height - y) / scale],
      edited: true,
      fontWeight: "normal",
      fontStyle: "normal",
      fontName: "",
      pdfX: x / scale,
      pdfY: (pageDimensions.height - y) / scale - pdfFontSize,
      pdfFontSize,
      pdfWidth: 100 / scale,
      isNew: true,
      color: selectedColor,
    }

    setTextItems(prev => [...prev, newItem])
    setAddTextMode(false)
    setEditingId(newId)
    saveToHistory([...textItems, newItem])
  }

  const getPlainText = (html: string): string => {
    const div = document.createElement("div")
    div.innerHTML = html
    return div.textContent || ""
  }

  const initSignCanvas = useCallback(() => {
    const canvas = signCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
  }, [])

  useEffect(() => {
    if (showSignPad) {
      setTimeout(initSignCanvas, 50)
    }
  }, [showSignPad, initSignCanvas])

  const startDrawingSignature = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    isDrawingSignature.current = true
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const drawSignature = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingSignature.current) return
    const canvas = signCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawingSignature = () => {
    isDrawingSignature.current = false
  }

  const clearSignature = () => {
    initSignCanvas()
  }

  const saveSignature = () => {
    const canvas = signCanvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL("image/png")
    const newSig: SignatureItem = {
      id: `sig-${Date.now()}`,
      dataUrl,
      x: pageDimensions.width / 2 - 75,
      y: pageDimensions.height / 2 - 25,
      width: 150,
      height: 50,
      pageIndex: currentPage,
    }
    setSignatures(prev => [...prev, newSig])
    setShowSignPad(false)
    setSelectedSignature(newSig.id)
    setCurrentTool("select")
  }

  const deleteSignature = (id: string) => {
    setSignatures(prev => prev.filter(s => s.id !== id))
    setSelectedSignature(null)
  }

  const startDraggingSignature = (e: React.MouseEvent, sigId: string) => {
    if (currentTool !== "select") return
    e.preventDefault()
    e.stopPropagation()
    const sig = signatures.find(s => s.id === sigId)
    if (!sig || !editorRef.current) return
    const rect = editorRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    setDraggingSignature(sigId)
    setSelectedSignature(sigId)
    setDragOffset({ x: mouseX - sig.x, y: mouseY - sig.y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editorRef.current) return
    const rect = editorRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    if ((resizingSignature || resizingImage) && resizeStart && resizeCorner) {
      const deltaX = mouseX - resizeStart.x
      const deltaY = mouseY - resizeStart.y
      let newWidth = resizeStart.width
      let newHeight = resizeStart.height
      let newX = resizeStart.sigX
      let newY = resizeStart.sigY

      if (resizeCorner === "br") {
        newWidth = Math.max(50, resizeStart.width + deltaX)
        newHeight = Math.max(30, resizeStart.height + deltaY)
      } else if (resizeCorner === "bl") {
        newWidth = Math.max(50, resizeStart.width - deltaX)
        newHeight = Math.max(30, resizeStart.height + deltaY)
        newX = resizeStart.sigX + (resizeStart.width - newWidth)
      } else if (resizeCorner === "tr") {
        newWidth = Math.max(50, resizeStart.width + deltaX)
        newHeight = Math.max(30, resizeStart.height - deltaY)
        newY = resizeStart.sigY + (resizeStart.height - newHeight)
      } else if (resizeCorner === "tl") {
        newWidth = Math.max(50, resizeStart.width - deltaX)
        newHeight = Math.max(30, resizeStart.height - deltaY)
        newX = resizeStart.sigX + (resizeStart.width - newWidth)
        newY = resizeStart.sigY + (resizeStart.height - newHeight)
      }

      if (resizingSignature) {
        setSignatures(prev => prev.map(sig =>
          sig.id === resizingSignature
            ? { ...sig, x: newX, y: newY, width: newWidth, height: newHeight }
            : sig
        ))
      } else if (resizingImage) {
        setImages(prev => prev.map(img =>
          img.id === resizingImage
            ? { ...img, x: newX, y: newY, width: newWidth, height: newHeight }
            : img
        ))
      }
      return
    }

    if (draggingImage) {
      const newX = mouseX - dragOffset.x
      const newY = mouseY - dragOffset.y
      setImages(prev => prev.map(img =>
        img.id === draggingImage
          ? { ...img, x: Math.max(0, Math.min(newX, pageDimensions.width - img.width)), y: Math.max(0, Math.min(newY, pageDimensions.height - img.height)) }
          : img
      ))
      return
    }

    if (!draggingSignature) return
    const newX = mouseX - dragOffset.x
    const newY = mouseY - dragOffset.y
    setSignatures(prev => prev.map(sig =>
      sig.id === draggingSignature
        ? { ...sig, x: Math.max(0, Math.min(newX, pageDimensions.width - sig.width)), y: Math.max(0, Math.min(newY, pageDimensions.height - sig.height)) }
        : sig
    ))
  }

  const startResizingSignature = (e: React.MouseEvent, sigId: string, corner: "tl" | "tr" | "bl" | "br") => {
    e.preventDefault()
    e.stopPropagation()
    const sig = signatures.find(s => s.id === sigId)
    if (!sig || !editorRef.current) return
    const rect = editorRef.current.getBoundingClientRect()
    setResizingSignature(sigId)
    setResizeCorner(corner)
    setResizeStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      width: sig.width,
      height: sig.height,
      sigX: sig.x,
      sigY: sig.y,
    })
  }

  const stopDragging = () => {
    setDraggingSignature(null)
    setDraggingImage(null)
    setResizingSignature(null)
    setResizingImage(null)
    setResizeCorner(null)
    setResizeStart(null)
  }

  const handleDownload = useCallback(async () => {
    if (!file) return

    setDownloading(true)
    try {
      const editedItems = textItems.filter((item) => item.edited)
      const { editPdfWithAnnotations } = await import("@/lib/pdf")
      const result = await editPdfWithAnnotations(
        file,
        editedItems,
        signatures.map(s => ({
          ...s,
          pdfX: s.x / scale,
          pdfY: (pageDimensions.height - s.y - s.height) / scale,
          pdfWidth: s.width / scale,
          pdfHeight: s.height / scale,
        })),
        images.map(img => ({
          ...img,
          pdfX: img.x / scale,
          pdfY: (pageDimensions.height - img.y - img.height) / scale,
          pdfWidth: img.width / scale,
          pdfHeight: img.height / scale,
        })),
        scale,
        pageRotations,
        deletedPages,
        pageOrder
      )
      const name = file.name.replace(".pdf", "-edited.pdf")
      downloadBytes(result, name)
    } catch (e) {
      console.error("failed to save pdf", e)
    }
    setDownloading(false)
  }, [file, textItems, signatures, images, scale, pageDimensions, pageRotations, deletedPages, pageOrder])

  const currentPageItems = textItems.filter((item) => item.pageIndex === currentPage)
  const isReordered = pageOrder.length > 0 && pageOrder.some((p, i) => p !== i)
  const hasEdits = textItems.some((item) => item.edited) || signatures.length > 0 || images.length > 0 || deletedPages.size > 0 || Object.values(pageRotations).some(r => r !== 0) || isReordered

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
            <Dropzone onFiles={handleFile} accept=".pdf" className="mx-auto max-w-2xl" />
            {loading && <p className="mt-4 text-center text-muted-foreground">loading pdf...</p>}
            <div className="mt-8 mx-auto max-w-xl text-center text-sm text-muted-foreground">
              <p>upload a pdf to edit its text directly.</p>
              <p className="mt-2">click on any text to edit it in place.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 min-h-0">
            {showThumbnails && pageThumbnails.length > 1 && (
              <aside className="w-32 lg:w-40 border-r bg-muted/30 overflow-y-auto hidden sm:block">
                <div className="p-2 space-y-2">
                  {pageOrder.map((originalIndex, displayIndex) => (
                    <div
                      key={originalIndex}
                      draggable
                      onDragStart={() => handlePageDragStart(displayIndex)}
                      onDragOver={(e) => handlePageDragOver(e, displayIndex)}
                      onDragEnd={() => { setDraggedPage(null); setDragOverPage(null) }}
                      onDrop={() => handlePageDrop(displayIndex)}
                      onClick={() => setCurrentPage(originalIndex)}
                      className={`relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                        currentPage === originalIndex
                          ? "border-blue-500 ring-2 ring-blue-500/20"
                          : dragOverPage === displayIndex
                          ? "border-blue-300 bg-blue-50"
                          : "border-transparent hover:border-muted-foreground/30"
                      } ${deletedPages.has(originalIndex) ? "opacity-40" : ""} ${
                        draggedPage === displayIndex ? "opacity-50 scale-95" : ""
                      }`}
                    >
                      <div className="absolute top-1 left-1 z-10 cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <img
                        src={pageThumbnails[originalIndex]}
                        alt={`Page ${originalIndex + 1}`}
                        className="w-full"
                        draggable={false}
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-background/80 backdrop-blur-sm py-0.5 text-center text-xs font-medium">
                        {originalIndex + 1}
                      </div>
                      {deletedPages.has(originalIndex) && (
                        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                          <Trash className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </aside>
            )}

            <div className="flex flex-1 flex-col min-h-0">
              <div className="border-b px-2 sm:px-4 py-2 sm:py-3 overflow-x-auto">
                <div className="flex items-center justify-between gap-2 min-w-max">
                  <div className="flex items-center gap-1">
                    {pageThumbnails.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowThumbnails(!showThumbnails)}
                        title={showThumbnails ? "Hide pages" : "Show pages"}
                        className="h-8 w-8 hidden sm:flex"
                      >
                        {showThumbnails ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={undo}
                      disabled={historyIndex <= 0}
                      title="Undo"
                      className="h-8 w-8"
                    >
                      <Undo2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={redo}
                      disabled={historyIndex >= history.length - 1}
                      title="Redo"
                      className="h-8 w-8"
                    >
                      <Redo2 className="h-4 w-4" />
                    </Button>

                    <div className="w-px h-6 bg-border mx-1 sm:mx-3" />

                    <div className="flex items-center bg-muted rounded-lg p-1 gap-1">
                      <button
                        onClick={() => { setCurrentTool("select"); setAddTextMode(false) }}
                        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          currentTool === "select" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <MousePointer className="h-4 w-4" />
                        <span className="hidden sm:inline">Select</span>
                      </button>
                      <button
                        onClick={() => { setCurrentTool("text"); setAddTextMode(true) }}
                        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          currentTool === "text" || addTextMode ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Type className="h-4 w-4" />
                        <span className="hidden sm:inline">Text</span>
                      </button>
                      <button
                        onClick={() => { setCurrentTool("sign"); setAddTextMode(false); setShowSignPad(true) }}
                        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          currentTool === "sign" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <PenTool className="h-4 w-4" />
                        <span className="hidden sm:inline">Sign</span>
                      </button>
                      <button
                        onClick={() => { setCurrentTool("image"); setAddTextMode(false); imageInputRef.current?.click() }}
                        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          currentTool === "image" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Image className="h-4 w-4" />
                        <span className="hidden sm:inline">Image</span>
                      </button>
                    </div>

                    <div className="w-px h-6 bg-border mx-1 sm:mx-2" />

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => rotatePage(currentPage)}
                        title="Rotate page"
                        className="h-8 w-8"
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                      {!deletedPages.has(currentPage) && pageCanvases.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deletePage(currentPage)}
                          title="Delete page"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        let prev = currentPage - 1
                        while (prev >= 0 && deletedPages.has(prev)) prev--
                        if (prev >= 0) setCurrentPage(prev)
                      }}
                      disabled={currentPage === 0 || Array.from({ length: currentPage }, (_, i) => i).every(i => deletedPages.has(i))}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm tabular-nums">
                      {currentPage + 1} / {pageCanvases.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        let next = currentPage + 1
                        while (next < pageCanvases.length && deletedPages.has(next)) next++
                        if (next < pageCanvases.length) setCurrentPage(next)
                      }}
                      disabled={currentPage === pageCanvases.length - 1 || Array.from({ length: pageCanvases.length - currentPage - 1 }, (_, i) => currentPage + 1 + i).every(i => deletedPages.has(i))}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="flex-1 overflow-auto bg-muted/50 p-2 sm:p-4">
                {(addTextMode || currentTool === "text") && (
                  <div className="text-center text-sm text-blue-600 mb-2">
                    Click anywhere on the PDF to add new text
                  </div>
                )}
                <div className="mx-auto w-fit">
                  <div
                    ref={editorRef}
                    className={`relative bg-white shadow-lg ${
                      addTextMode || currentTool === "text" ? "cursor-crosshair" : ""
                    } ${isDroppingImage ? "ring-4 ring-blue-500 ring-opacity-50" : ""}`}
                    style={{ width: pageDimensions.width, height: pageDimensions.height }}
                    onClick={addTextMode || currentTool === "text" ? addNewText : undefined}
                    onMouseMove={handleMouseMove}
                    onMouseUp={stopDragging}
                    onMouseLeave={stopDragging}
                    onDragOver={handleEditorDragOver}
                    onDragLeave={handleEditorDragLeave}
                    onDrop={handleImageDrop}
                  >
                    {isDroppingImage && (
                      <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center z-50 pointer-events-none">
                        <div className="bg-background/90 rounded-lg px-6 py-4 shadow-lg">
                          <p className="text-lg font-medium text-blue-600">Drop image here</p>
                        </div>
                      </div>
                    )}
                    {pageCanvases[currentPage] && (
                      <img
                        src={pageCanvases[currentPage]}
                        alt={`page ${currentPage + 1}`}
                        className="absolute inset-0 h-full w-full"
                        draggable={false}
                        style={{
                          transform: `rotate(${pageRotations[currentPage] || 0}deg)`,
                        }}
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
                          {item.edited && item.str === "" ? (
                            <div
                              className="bg-white h-full w-full"
                              style={{ minWidth: item.width }}
                            />
                          ) : editingId === item.id ? (
                            <div className="relative">
                              <div
                                className="absolute flex items-center gap-1 bg-white border border-gray-300 rounded shadow-lg p-1.5 z-10"
                                style={{ bottom: item.height + 4, left: 0 }}
                                onMouseDown={(e) => e.preventDefault()}
                              >
                                <select
                                  value={selectedFont}
                                  onChange={(e) => applyFont(e.target.value)}
                                  className="h-7 px-1 text-xs border border-gray-300 rounded bg-white text-gray-700"
                                  title="Font"
                                >
                                  {fonts.map((font) => (
                                    <option key={font} value={font} style={{ fontFamily: font }}>
                                      {font}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  value={selectedFontSize}
                                  onChange={(e) => applyFontSize(Number(e.target.value))}
                                  className="h-7 w-14 px-1 text-xs border border-gray-300 rounded bg-white text-gray-700"
                                  title="Font size"
                                >
                                  {fontSizes.map((size) => (
                                    <option key={size} value={size}>
                                      {size}
                                    </option>
                                  ))}
                                </select>
                                <div className="w-px h-5 bg-gray-300 mx-1" />
                                <button
                                  type="button"
                                  onClick={applyBold}
                                  className="p-1 rounded hover:bg-gray-100 text-gray-700"
                                  title="Bold"
                                >
                                  <Bold className="h-4 w-4" strokeWidth={2.5} />
                                </button>
                                <button
                                  type="button"
                                  onClick={applyItalic}
                                  className="p-1 rounded hover:bg-gray-100 text-gray-700"
                                  title="Italic"
                                >
                                  <Italic className="h-4 w-4" strokeWidth={2.5} />
                                </button>
                                <button
                                  type="button"
                                  onClick={applyUnderline}
                                  className="p-1 rounded hover:bg-gray-100 text-gray-700"
                                  title="Underline"
                                >
                                  <Underline className="h-4 w-4" strokeWidth={2.5} />
                                </button>
                                <div className="w-px h-5 bg-gray-300 mx-1" />
                                <input
                                  type="color"
                                  value={selectedColor}
                                  onChange={(e) => applyColor(e.target.value)}
                                  className="w-7 h-7 rounded cursor-pointer border border-gray-300"
                                  title="Text color"
                                />
                                <div className="w-px h-5 bg-gray-300 mx-1" />
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                                    className={`p-1 rounded text-gray-700 flex items-center gap-0.5 ${showHighlightPicker ? "bg-gray-200" : "hover:bg-gray-100"}`}
                                    title="Highlight text"
                                  >
                                    <Highlighter className="h-4 w-4" strokeWidth={2.5} />
                                  </button>
                                  {showHighlightPicker && (
                                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg p-1.5 flex gap-1 z-20">
                                      {textHighlightColors.map((hc) => (
                                        <button
                                          key={hc.color}
                                          type="button"
                                          onClick={() => {
                                            applyTextHighlight(hc.color)
                                            setShowHighlightPicker(false)
                                          }}
                                          className="w-5 h-5 rounded hover:scale-110 transition-transform"
                                          style={{ backgroundColor: hc.color }}
                                          title={hc.name}
                                        />
                                      ))}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          applyTextHighlight("transparent")
                                          setShowHighlightPicker(false)
                                        }}
                                        className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform flex items-center justify-center text-gray-400"
                                        title="Remove highlight"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <div className="w-px h-5 bg-gray-300 mx-1" />
                                <button
                                  type="button"
                                  onClick={() => applyAlignment("left")}
                                  className="p-1 rounded hover:bg-gray-100 text-gray-700"
                                  title="Align left"
                                >
                                  <AlignLeft className="h-4 w-4" strokeWidth={2.5} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => applyAlignment("center")}
                                  className="p-1 rounded hover:bg-gray-100 text-gray-700"
                                  title="Align center"
                                >
                                  <AlignCenter className="h-4 w-4" strokeWidth={2.5} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => applyAlignment("right")}
                                  className="p-1 rounded hover:bg-gray-100 text-gray-700"
                                  title="Align right"
                                >
                                  <AlignRight className="h-4 w-4" strokeWidth={2.5} />
                                </button>
                              </div>
                              <div
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                  handleTextChange(item.id, e.currentTarget.innerHTML)
                                  commitChange()
                                  setEditingId(null)
                                  setShowHighlightPicker(false)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Escape") {
                                    handleTextChange(item.id, e.currentTarget.innerHTML)
                                    commitChange()
                                    setEditingId(null)
                                    setShowHighlightPicker(false)
                                  }
                                }}
                                ref={(el) => {
                                  if (el && !el.innerHTML) {
                                    el.innerHTML = item.str || (item.isNew ? "New text" : "")
                                    el.focus()
                                    const range = document.createRange()
                                    range.selectNodeContents(el)
                                    range.collapse(false)
                                    const sel = window.getSelection()
                                    sel?.removeAllRanges()
                                    sel?.addRange(range)
                                  }
                                }}
                                className="bg-white outline-none"
                                style={{
                                  fontSize: item.fontSize,
                                  lineHeight: `${item.height}px`,
                                  minHeight: item.height,
                                  minWidth: item.width,
                                  fontFamily: "Helvetica, Arial, sans-serif",
                                  color: "#000",
                                  padding: "0 2px",
                                  margin: 0,
                                  border: "1px solid #3b82f6",
                                  borderRadius: 2,
                                  whiteSpace: "nowrap",
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              onClick={() => setEditingId(item.id)}
                              className={`cursor-text ${
                                item.edited ? "bg-white hover:bg-gray-100" : "hover:bg-blue-100/30"
                              }`}
                              style={{
                                fontSize: item.fontSize,
                                lineHeight: `${item.height}px`,
                                fontFamily: "Helvetica, Arial, sans-serif",
                                color: item.edited ? "#000" : "transparent",
                                whiteSpace: "nowrap",
                              }}
                              dangerouslySetInnerHTML={{ __html: item.str }}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="absolute inset-0 pointer-events-none">
                      {signatures
                        .filter((s) => s.pageIndex === currentPage)
                        .map((sig) => (
                          <div
                            key={sig.id}
                            className={`absolute pointer-events-auto group ${
                              currentTool === "select" ? "cursor-move" : "cursor-default"
                            } ${selectedSignature === sig.id ? "ring-2 ring-blue-500" : ""}`}
                            style={{
                              left: sig.x,
                              top: sig.y,
                              width: sig.width,
                              height: sig.height,
                            }}
                            onMouseDown={(e) => startDraggingSignature(e, sig.id)}
                            onClick={() => setSelectedSignature(sig.id)}
                          >
                            <img
                              src={sig.dataUrl}
                              alt="Signature"
                              className="w-full h-full object-contain pointer-events-none"
                              draggable={false}
                            />
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteSignature(sig.id) }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-md"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                            {selectedSignature === sig.id && currentTool === "select" && (
                              <>
                                <div
                                  onMouseDown={(e) => startResizingSignature(e, sig.id, "tl")}
                                  className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-sm cursor-nw-resize"
                                />
                                <div
                                  onMouseDown={(e) => startResizingSignature(e, sig.id, "tr")}
                                  className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-sm cursor-ne-resize"
                                />
                                <div
                                  onMouseDown={(e) => startResizingSignature(e, sig.id, "bl")}
                                  className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-sm cursor-sw-resize"
                                />
                                <div
                                  onMouseDown={(e) => startResizingSignature(e, sig.id, "br")}
                                  className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-sm cursor-se-resize"
                                />
                              </>
                            )}
                          </div>
                        ))}
                    </div>

                    <div className="absolute inset-0 pointer-events-none">
                      {images
                        .filter((img) => img.pageIndex === currentPage)
                        .map((img) => (
                          <div
                            key={img.id}
                            className={`absolute pointer-events-auto group ${
                              currentTool === "select" ? "cursor-move" : "cursor-default"
                            } ${selectedImage === img.id ? "ring-2 ring-blue-500" : ""}`}
                            style={{
                              left: img.x,
                              top: img.y,
                              width: img.width,
                              height: img.height,
                            }}
                            onMouseDown={(e) => startDraggingImage(e, img.id)}
                            onClick={() => setSelectedImage(img.id)}
                          >
                            <img
                              src={img.dataUrl}
                              alt="Added image"
                              className="w-full h-full object-contain pointer-events-none"
                              draggable={false}
                            />
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteImage(img.id) }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-md"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                            {selectedImage === img.id && currentTool === "select" && (
                              <>
                                <div
                                  onMouseDown={(e) => startResizingImage(e, img.id, "tl")}
                                  className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-sm cursor-nw-resize"
                                />
                                <div
                                  onMouseDown={(e) => startResizingImage(e, img.id, "tr")}
                                  className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-sm cursor-ne-resize"
                                />
                                <div
                                  onMouseDown={(e) => startResizingImage(e, img.id, "bl")}
                                  className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-sm cursor-sw-resize"
                                />
                                <div
                                  onMouseDown={(e) => startResizingImage(e, img.id, "br")}
                                  className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-sm cursor-se-resize"
                                />
                              </>
                            )}
                          </div>
                        ))}
                    </div>

                    {deletedPages.has(currentPage) && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20">
                        <p className="text-white text-lg font-medium mb-4">This page is marked for deletion</p>
                        <Button
                          variant="outline"
                          onClick={() => restorePage(currentPage)}
                        >
                          Restore Page
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <aside className="w-48 lg:w-64 border-l bg-background p-3 lg:p-4 hidden md:block">
              <h2 className="font-medium">edit pdf</h2>

              <div className="mt-4 text-sm text-muted-foreground space-y-2">
                <p>• click any text to edit</p>
                <p>• drag images onto pdf</p>
                <p>• drag pages to reorder</p>
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
                    setSignatures([])
                    setImages([])
                    setDeletedPages(new Set())
                    setPageRotations({})
                    setPageOrder(Array.from({ length: pageCanvases.length }, (_, i) => i))
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
                    setSignatures([])
                    setImages([])
                    setDeletedPages(new Set())
                    setPageRotations({})
                    setPageThumbnails([])
                    setPageOrder([])
                  }}
                >
                  load different pdf
                </Button>
              </div>

              {(signatures.length > 0 || images.length > 0) && (
                <div className="mt-6 pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2">Annotations</h3>
                  {signatures.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {signatures.length} signature{signatures.length !== 1 ? "s" : ""}
                    </p>
                  )}
                  {images.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {images.length} image{images.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              )}

              {deletedPages.size > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2">Deleted Pages</h3>
                  <p className="text-sm text-muted-foreground">
                    {deletedPages.size} page{deletedPages.size !== 1 ? "s" : ""} marked for deletion
                  </p>
                </div>
              )}

              {Object.keys(pageRotations).length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2">Rotated Pages</h3>
                  <p className="text-sm text-muted-foreground">
                    {Object.keys(pageRotations).filter(k => pageRotations[Number(k)] !== 0).length} page{Object.keys(pageRotations).filter(k => pageRotations[Number(k)] !== 0).length !== 1 ? "s" : ""} rotated
                  </p>
                </div>
              )}

              {isReordered && (
                <div className="mt-6 pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2">Page Order</h3>
                  <p className="text-sm text-muted-foreground">
                    pages reordered
                  </p>
                </div>
              )}
            </aside>
          </div>
        )}

        {showSignPad && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-xl shadow-2xl p-6 w-[500px] max-w-[90vw]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Draw your signature</h2>
                <button
                  onClick={() => setShowSignPad(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="border-2 border-dashed border-muted rounded-lg overflow-hidden bg-white">
                <canvas
                  ref={signCanvasRef}
                  width={460}
                  height={200}
                  className="cursor-crosshair touch-none"
                  onMouseDown={startDrawingSignature}
                  onMouseMove={drawSignature}
                  onMouseUp={stopDrawingSignature}
                  onMouseLeave={stopDrawingSignature}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Draw your signature above using your mouse or touchpad
              </p>
              <div className="flex items-center justify-end gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={clearSignature}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
                <Button
                  onClick={saveSignature}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  Add Signature
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
