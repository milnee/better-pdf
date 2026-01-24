import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib"

export async function loadPdf(file: File): Promise<PDFDocument> {
  const buffer = await file.arrayBuffer()
  return PDFDocument.load(buffer)
}

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create()

  for (const file of files) {
    const pdf = await loadPdf(file)
    const pages = await merged.copyPages(pdf, pdf.getPageIndices())
    for (const page of pages) {
      merged.addPage(page)
    }
  }

  return merged.save()
}

export interface TextOverlay {
  text: string
  x: number
  y: number
  size: number
  color: { r: number; g: number; b: number }
  pageIndex: number
}

export async function addTextToPdf(
  file: File,
  overlays: TextOverlay[]
): Promise<Uint8Array> {
  const pdf = await loadPdf(file)
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const pages = pdf.getPages()

  for (const overlay of overlays) {
    const page = pages[overlay.pageIndex]
    if (!page) continue

    page.drawText(overlay.text, {
      x: overlay.x,
      y: overlay.y,
      size: overlay.size,
      font,
      color: rgb(overlay.color.r / 255, overlay.color.g / 255, overlay.color.b / 255),
    })
  }

  return pdf.save()
}

export async function imagesToPdf(
  images: File[],
  pageSize: "fit" | "a4" | "letter" = "fit"
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()

  const pageSizes = {
    a4: { width: 595.28, height: 841.89 },
    letter: { width: 612, height: 792 },
  }

  for (const image of images) {
    const buffer = await image.arrayBuffer()
    const bytes = new Uint8Array(buffer)

    let embedded
    if (image.type === "image/png") {
      embedded = await pdf.embedPng(bytes)
    } else if (image.type === "image/jpeg" || image.type === "image/jpg") {
      embedded = await pdf.embedJpg(bytes)
    } else {
      continue
    }

    const { width, height } = embedded.scale(1)

    let pageWidth: number
    let pageHeight: number
    let drawWidth: number
    let drawHeight: number
    let x: number
    let y: number

    if (pageSize === "fit") {
      pageWidth = width
      pageHeight = height
      drawWidth = width
      drawHeight = height
      x = 0
      y = 0
    } else {
      const size = pageSizes[pageSize]
      pageWidth = size.width
      pageHeight = size.height

      const scale = Math.min(pageWidth / width, pageHeight / height)
      drawWidth = width * scale
      drawHeight = height * scale
      x = (pageWidth - drawWidth) / 2
      y = (pageHeight - drawHeight) / 2
    }

    const page = pdf.addPage([pageWidth, pageHeight])
    page.drawImage(embedded, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    })
  }

  return pdf.save()
}

export async function getPdfPageCount(file: File): Promise<number> {
  const pdf = await loadPdf(file)
  return pdf.getPageCount()
}

export async function createPdfFromText(
  pages: string[],
  options: { fontSize?: number; margin?: number } = {}
): Promise<Uint8Array> {
  const { fontSize = 12, margin = 50 } = options
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)

  const pageWidth = 612
  const pageHeight = 792
  const lineHeight = fontSize * 1.4
  const maxWidth = pageWidth - margin * 2
  const maxLines = Math.floor((pageHeight - margin * 2) / lineHeight)

  const wrapLine = (text: string): string[] => {
    if (!text) return [""]
    const words = text.split(" ")
    const wrapped: string[] = []
    let currentLine = ""

    for (const word of words) {
      if (!word) {
        currentLine += " "
        continue
      }
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const width = font.widthOfTextAtSize(testLine, fontSize)

      if (width <= maxWidth) {
        currentLine = testLine
      } else {
        if (currentLine) wrapped.push(currentLine)
        currentLine = word
      }
    }
    if (currentLine) wrapped.push(currentLine)
    return wrapped.length > 0 ? wrapped : [""]
  }

  for (const pageText of pages) {
    const inputLines = pageText.split("\n")
    const lines: string[] = []

    for (const line of inputLines) {
      const wrapped = wrapLine(line)
      lines.push(...wrapped)
    }

    if (lines.length === 0) lines.push("")

    for (let i = 0; i < lines.length; i += maxLines) {
      const page = pdf.addPage([pageWidth, pageHeight])
      const pageLines = lines.slice(i, i + maxLines)
      let y = pageHeight - margin

      for (const line of pageLines) {
        if (line) {
          page.drawText(line, {
            x: margin,
            y: y - fontSize,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
          })
        }
        y -= lineHeight
      }
    }
  }

  if (pdf.getPageCount() === 0) {
    pdf.addPage([612, 792])
  }

  return pdf.save()
}

export interface PageImage {
  id: string
  dataUrl: string
  x: number
  y: number
  width: number
  height: number
  pageIndex: number
}

export interface PageText {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  pageIndex: number
}

export async function addContentToPdf(
  file: File,
  texts: PageText[],
  images: PageImage[],
  editorDimensions: { width: number; height: number }
): Promise<Uint8Array> {
  const pdf = await loadPdf(file)
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const pages = pdf.getPages()

  for (const t of texts) {
    const page = pages[t.pageIndex]
    if (!page) continue

    const { width: pageWidth, height: pageHeight } = page.getSize()
    const scaleX = pageWidth / editorDimensions.width
    const scaleY = pageHeight / editorDimensions.height

    const pdfX = t.x * scaleX
    const pdfY = pageHeight - (t.y + t.fontSize) * scaleY
    const textWidth = font.widthOfTextAtSize(t.text, t.fontSize * scaleY)
    const textHeight = t.fontSize * scaleY * 1.2

    page.drawRectangle({
      x: pdfX - 2,
      y: pdfY - 2,
      width: textWidth + 4,
      height: textHeight + 4,
      color: rgb(1, 1, 1),
    })

    page.drawText(t.text, {
      x: pdfX,
      y: pdfY,
      size: t.fontSize * scaleY,
      font,
      color: rgb(0, 0, 0),
    })
  }

  for (const img of images) {
    const page = pages[img.pageIndex]
    if (!page) continue

    try {
      const { width: pageWidth, height: pageHeight } = page.getSize()
      const scaleX = pageWidth / editorDimensions.width
      const scaleY = pageHeight / editorDimensions.height

      const base64Data = img.dataUrl.split(",")[1]
      const bytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))

      let embedded
      if (img.dataUrl.includes("image/png")) {
        embedded = await pdf.embedPng(bytes)
      } else if (img.dataUrl.includes("image/jpeg") || img.dataUrl.includes("image/jpg")) {
        embedded = await pdf.embedJpg(bytes)
      } else {
        continue
      }

      const pdfX = img.x * scaleX
      const pdfY = pageHeight - (img.y + img.height) * scaleY
      const pdfWidth = img.width * scaleX
      const pdfHeight = img.height * scaleY

      page.drawImage(embedded, {
        x: pdfX,
        y: pdfY,
        width: pdfWidth,
        height: pdfHeight,
      })
    } catch (e) {
      console.error("failed to embed image", e)
    }
  }

  return pdf.save()
}

export async function createPdfWithImages(
  pages: string[],
  images: PageImage[],
  options: { fontSize?: number; margin?: number } = {}
): Promise<Uint8Array> {
  const { fontSize = 12, margin = 50 } = options
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)

  const pageWidth = 612
  const pageHeight = 792
  const lineHeight = fontSize * 1.4
  const maxWidth = pageWidth - margin * 2

  const editorHeight = 700
  const editorWidth = 768
  const scaleX = pageWidth / editorWidth
  const scaleY = pageHeight / editorHeight

  const wrapLine = (text: string): string[] => {
    if (!text) return [""]
    const words = text.split(" ")
    const wrapped: string[] = []
    let currentLine = ""

    for (const word of words) {
      if (!word) {
        currentLine += " "
        continue
      }
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const width = font.widthOfTextAtSize(testLine, fontSize)

      if (width <= maxWidth) {
        currentLine = testLine
      } else {
        if (currentLine) wrapped.push(currentLine)
        currentLine = word
      }
    }
    if (currentLine) wrapped.push(currentLine)
    return wrapped.length > 0 ? wrapped : [""]
  }

  const pdfPages: ReturnType<typeof pdf.addPage>[] = []

  for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
    const pageText = pages[pageIdx]
    const inputLines = pageText.split("\n")
    const lines: string[] = []

    for (const line of inputLines) {
      const wrapped = wrapLine(line)
      lines.push(...wrapped)
    }

    if (lines.length === 0) lines.push("")

    const page = pdf.addPage([pageWidth, pageHeight])
    pdfPages.push(page)
    let y = pageHeight - margin

    for (const line of lines) {
      if (y < margin) break
      if (line) {
        page.drawText(line, {
          x: margin,
          y: y - fontSize,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        })
      }
      y -= lineHeight
    }
  }

  for (const img of images) {
    const page = pdfPages[img.pageIndex]
    if (!page) continue

    try {
      const base64Data = img.dataUrl.split(",")[1]
      const bytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))

      let embedded
      if (img.dataUrl.includes("image/png")) {
        embedded = await pdf.embedPng(bytes)
      } else if (img.dataUrl.includes("image/jpeg") || img.dataUrl.includes("image/jpg")) {
        embedded = await pdf.embedJpg(bytes)
      } else {
        continue
      }

      const pdfX = img.x * scaleX
      const pdfY = pageHeight - (img.y + img.height) * scaleY
      const pdfWidth = img.width * scaleX
      const pdfHeight = img.height * scaleY

      page.drawImage(embedded, {
        x: pdfX,
        y: pdfY,
        width: pdfWidth,
        height: pdfHeight,
      })
    } catch (e) {
      console.error("failed to embed image", e)
    }
  }

  if (pdf.getPageCount() === 0) {
    pdf.addPage([612, 792])
  }

  return pdf.save()
}

export async function addWatermark(
  file: File,
  options: { text: string; opacity?: number; fontSize?: number }
): Promise<Uint8Array> {
  const { text, opacity = 0.3, fontSize = 48 } = options
  const pdf = await loadPdf(file)
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const pages = pdf.getPages()

  for (const page of pages) {
    const { width, height } = page.getSize()
    const textWidth = font.widthOfTextAtSize(text, fontSize)

    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity,
      rotate: degrees(-45),
    })
  }

  return pdf.save()
}

export interface EditedTextItem {
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
}

export async function editPdfText(
  file: File,
  editedItems: EditedTextItem[],
  scale: number
): Promise<Uint8Array> {
  const pdf = await loadPdf(file)
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const pages = pdf.getPages()

  for (const item of editedItems) {
    const page = pages[item.pageIndex]
    if (!page) continue

    const { height: pageHeight } = page.getSize()

    const pdfX = item.x / scale
    const pdfY = pageHeight - (item.y / scale) - (item.fontSize / scale)
    const pdfFontSize = item.fontSize / scale

    const originalWidth = font.widthOfTextAtSize(item.originalStr, pdfFontSize)
    const originalHeight = pdfFontSize * 1.3

    page.drawRectangle({
      x: pdfX - 1,
      y: pdfY - 2,
      width: originalWidth + 2,
      height: originalHeight + 2,
      color: rgb(1, 1, 1),
    })

    page.drawText(item.str, {
      x: pdfX,
      y: pdfY,
      size: pdfFontSize,
      font,
      color: rgb(0, 0, 0),
    })
  }

  return pdf.save()
}

export async function addSignature(
  file: File,
  signatureDataUrl: string,
  position: { x: number; y: number; width: number; height: number; pageIndex: number },
  pageDimensions: { width: number; height: number }
): Promise<Uint8Array> {
  const pdf = await loadPdf(file)
  const pages = pdf.getPages()
  const page = pages[position.pageIndex]
  if (!page) return pdf.save()

  const { width: pageWidth, height: pageHeight } = page.getSize()
  const scaleX = pageWidth / pageDimensions.width
  const scaleY = pageHeight / pageDimensions.height

  try {
    const base64Data = signatureDataUrl.split(",")[1]
    const bytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))
    const embedded = await pdf.embedPng(bytes)

    const pdfX = position.x * scaleX
    const pdfY = pageHeight - (position.y + position.height) * scaleY
    const pdfWidth = position.width * scaleX
    const pdfHeight = position.height * scaleY

    page.drawImage(embedded, {
      x: pdfX,
      y: pdfY,
      width: pdfWidth,
      height: pdfHeight,
    })
  } catch (e) {
    console.error("failed to add signature", e)
  }

  return pdf.save()
}
