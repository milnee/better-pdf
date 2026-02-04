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

export type WatermarkPattern = "single" | "diagonal"

export async function addWatermark(
  file: File,
  options: { text: string; opacity?: number; fontSize?: number; pattern?: WatermarkPattern }
): Promise<Uint8Array> {
  const { text, opacity = 0.3, fontSize = 48, pattern = "single" } = options
  const pdf = await loadPdf(file)
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const pages = pdf.getPages()

  for (const page of pages) {
    const { width, height } = page.getSize()
    const textWidth = font.widthOfTextAtSize(text, fontSize)

    if (pattern === "single") {
      const singleSize = fontSize * 1.5
      const singleTextWidth = font.widthOfTextAtSize(text, singleSize)
      page.drawText(text, {
        x: (width - singleTextWidth * 0.7) / 2,
        y: height / 2,
        size: singleSize,
        font,
        color: rgb(0.5, 0.5, 0.5),
        opacity,
        rotate: degrees(-45),
      })
    } else if (pattern === "diagonal") {
      const spacingX = textWidth + 80
      const spacingY = fontSize * 3
      const cols = Math.ceil(width / spacingX) + 2
      const rows = Math.ceil(height / spacingY) + 2

      for (let row = -1; row <= rows; row++) {
        const offsetX = row % 2 === 0 ? 0 : spacingX / 2
        for (let col = -1; col <= cols; col++) {
          page.drawText(text, {
            x: col * spacingX + offsetX,
            y: row * spacingY,
            size: fontSize,
            font,
            color: rgb(0.5, 0.5, 0.5),
            opacity,
            rotate: degrees(-45),
          })
        }
      }
    }
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
  fontWeight: "normal" | "bold"
  fontStyle: "normal" | "italic"
  fontName: string
  pdfX: number
  pdfY: number
  pdfFontSize: number
  pdfWidth: number
}

interface TextSegment {
  text: string
  bold: boolean
  italic: boolean
  underline: boolean
  color: string
  fontFamily: string
  fontSize: number | null
  backgroundColor: string | null
}

function parseHtmlToSegments(html: string): TextSegment[] {
  const segments: TextSegment[] = []
  const div = typeof document !== "undefined" ? document.createElement("div") : null

  if (!div) {
    return [{ text: html.replace(/<[^>]*>/g, ""), bold: false, italic: false, underline: false, color: "#000000", fontFamily: "Helvetica", fontSize: null, backgroundColor: null }]
  }

  div.innerHTML = html

  function traverse(node: Node, bold: boolean, italic: boolean, underline: boolean, color: string, fontFamily: string, fontSize: number | null, backgroundColor: string | null) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || ""
      if (text) {
        segments.push({ text, bold, italic, underline, color, fontFamily, fontSize, backgroundColor })
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element
      const tagName = el.tagName.toLowerCase()
      const newBold = bold || tagName === "b" || tagName === "strong"
      const newItalic = italic || tagName === "i" || tagName === "em"
      const newUnderline = underline || tagName === "u"

      let newColor = color
      let newFontFamily = fontFamily
      let newFontSize = fontSize
      let newBackgroundColor = backgroundColor

      if (tagName === "font") {
        if (el.getAttribute("color")) {
          newColor = el.getAttribute("color") || color
        }
        if (el.getAttribute("face")) {
          newFontFamily = el.getAttribute("face") || fontFamily
        }
      }
      if (tagName === "span") {
        const style = el.getAttribute("style") || ""
        const colorMatch = style.match(/color:\s*([^;]+)/)
        if (colorMatch) {
          newColor = colorMatch[1].trim()
        }
        const fontFamilyMatch = style.match(/font-family:\s*([^;]+)/)
        if (fontFamilyMatch) {
          newFontFamily = fontFamilyMatch[1].trim().replace(/['"]/g, "")
        }
        const fontSizeMatch = style.match(/font-size:\s*(\d+(?:\.\d+)?)\s*px/)
        if (fontSizeMatch) {
          newFontSize = parseFloat(fontSizeMatch[1])
        }
        const bgColorMatch = style.match(/background-color:\s*([^;]+)/)
        if (bgColorMatch) {
          const bgColor = bgColorMatch[1].trim()
          if (bgColor !== "transparent" && bgColor !== "rgba(0, 0, 0, 0)") {
            newBackgroundColor = bgColor
          } else {
            newBackgroundColor = null
          }
        }
      }

      for (const child of Array.from(node.childNodes)) {
        traverse(child, newBold, newItalic, newUnderline, newColor, newFontFamily, newFontSize, newBackgroundColor)
      }
    }
  }

  traverse(div, false, false, false, "#000000", "Helvetica", null, null)
  return segments
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    return {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    }
  }
  const rgbMatch = hex.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]) / 255,
      g: parseInt(rgbMatch[2]) / 255,
      b: parseInt(rgbMatch[3]) / 255,
    }
  }
  return { r: 0, g: 0, b: 0 }
}

function getPlainTextFromHtml(html: string): string {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]*>/g, "")
  }
  const div = document.createElement("div")
  div.innerHTML = html
  return div.textContent || ""
}

export async function editPdfText(
  file: File,
  editedItems: EditedTextItem[],
  scale: number
): Promise<Uint8Array> {
  const pdf = await loadPdf(file)
  const pages = pdf.getPages()

  const helvetica = await pdf.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const helveticaItalic = await pdf.embedFont(StandardFonts.HelveticaOblique)
  const helveticaBoldItalic = await pdf.embedFont(StandardFonts.HelveticaBoldOblique)

  const timesRoman = await pdf.embedFont(StandardFonts.TimesRoman)
  const timesRomanBold = await pdf.embedFont(StandardFonts.TimesRomanBold)
  const timesRomanItalic = await pdf.embedFont(StandardFonts.TimesRomanItalic)
  const timesRomanBoldItalic = await pdf.embedFont(StandardFonts.TimesRomanBoldItalic)

  const courier = await pdf.embedFont(StandardFonts.Courier)
  const courierBold = await pdf.embedFont(StandardFonts.CourierBold)
  const courierItalic = await pdf.embedFont(StandardFonts.CourierOblique)
  const courierBoldItalic = await pdf.embedFont(StandardFonts.CourierBoldOblique)

  const fontMap: Record<string, { normal: typeof helvetica; bold: typeof helvetica; italic: typeof helvetica; boldItalic: typeof helvetica }> = {
    helvetica: { normal: helvetica, bold: helveticaBold, italic: helveticaItalic, boldItalic: helveticaBoldItalic },
    arial: { normal: helvetica, bold: helveticaBold, italic: helveticaItalic, boldItalic: helveticaBoldItalic },
    verdana: { normal: helvetica, bold: helveticaBold, italic: helveticaItalic, boldItalic: helveticaBoldItalic },
    "times new roman": { normal: timesRoman, bold: timesRomanBold, italic: timesRomanItalic, boldItalic: timesRomanBoldItalic },
    times: { normal: timesRoman, bold: timesRomanBold, italic: timesRomanItalic, boldItalic: timesRomanBoldItalic },
    georgia: { normal: timesRoman, bold: timesRomanBold, italic: timesRomanItalic, boldItalic: timesRomanBoldItalic },
    courier: { normal: courier, bold: courierBold, italic: courierItalic, boldItalic: courierBoldItalic },
    "courier new": { normal: courier, bold: courierBold, italic: courierItalic, boldItalic: courierBoldItalic },
    monospace: { normal: courier, bold: courierBold, italic: courierItalic, boldItalic: courierBoldItalic },
  }

  function getFont(fontFamily: string, bold: boolean, italic: boolean) {
    const family = fontMap[fontFamily.toLowerCase()] || fontMap.helvetica
    if (bold && italic) return family.boldItalic
    if (bold) return family.bold
    if (italic) return family.italic
    return family.normal
  }

  for (const item of editedItems) {
    const page = pages[item.pageIndex]
    if (!page) continue

    const pdfX = item.pdfX
    const pdfY = item.pdfY
    const pdfFontSize = item.pdfFontSize
    const originalWidth = item.pdfWidth + 20
    const originalHeight = pdfFontSize * 1.4

    page.drawRectangle({
      x: pdfX - 2,
      y: pdfY - pdfFontSize * 0.3,
      width: originalWidth,
      height: originalHeight,
      color: rgb(1, 1, 1),
    })

    const plainText = getPlainTextFromHtml(item.str)
    if (!plainText.trim()) continue

    const segments = parseHtmlToSegments(item.str)
    let currentX = pdfX

    for (const segment of segments) {
      if (!segment.text) continue

      const font = getFont(segment.fontFamily, segment.bold, segment.italic)
      const segmentFontSize = segment.fontSize !== null ? segment.fontSize : pdfFontSize

      const textColor = hexToRgb(segment.color)
      const textWidth = font.widthOfTextAtSize(segment.text, segmentFontSize)

      page.drawText(segment.text, {
        x: currentX,
        y: pdfY,
        size: segmentFontSize,
        font,
        color: rgb(textColor.r, textColor.g, textColor.b),
      })

      if (segment.underline) {
        page.drawLine({
          start: { x: currentX, y: pdfY - 2 },
          end: { x: currentX + textWidth, y: pdfY - 2 },
          thickness: segmentFontSize * 0.05,
          color: rgb(textColor.r, textColor.g, textColor.b),
        })
      }

      currentX += textWidth
    }
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

interface SignatureAnnotation {
  id: string
  dataUrl: string
  x: number
  y: number
  width: number
  height: number
  pageIndex: number
  pdfX: number
  pdfY: number
  pdfWidth: number
  pdfHeight: number
}

interface ImageAnnotation {
  id: string
  dataUrl: string
  x: number
  y: number
  width: number
  height: number
  pageIndex: number
  pdfX: number
  pdfY: number
  pdfWidth: number
  pdfHeight: number
}

export async function editPdfWithAnnotations(
  file: File,
  editedItems: EditedTextItem[],
  signatures: SignatureAnnotation[],
  images: ImageAnnotation[],
  scale: number,
  pageRotations: Record<number, number> = {},
  deletedPages: Set<number> = new Set(),
  pageOrder: number[] = []
): Promise<Uint8Array> {
  const pdf = await loadPdf(file)
  const pages = pdf.getPages()

  const helvetica = await pdf.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const helveticaItalic = await pdf.embedFont(StandardFonts.HelveticaOblique)
  const helveticaBoldItalic = await pdf.embedFont(StandardFonts.HelveticaBoldOblique)

  const timesRoman = await pdf.embedFont(StandardFonts.TimesRoman)
  const timesRomanBold = await pdf.embedFont(StandardFonts.TimesRomanBold)
  const timesRomanItalic = await pdf.embedFont(StandardFonts.TimesRomanItalic)
  const timesRomanBoldItalic = await pdf.embedFont(StandardFonts.TimesRomanBoldItalic)

  const courier = await pdf.embedFont(StandardFonts.Courier)
  const courierBold = await pdf.embedFont(StandardFonts.CourierBold)
  const courierItalic = await pdf.embedFont(StandardFonts.CourierOblique)
  const courierBoldItalic = await pdf.embedFont(StandardFonts.CourierBoldOblique)

  const fontMap: Record<string, { normal: typeof helvetica; bold: typeof helvetica; italic: typeof helvetica; boldItalic: typeof helvetica }> = {
    helvetica: { normal: helvetica, bold: helveticaBold, italic: helveticaItalic, boldItalic: helveticaBoldItalic },
    arial: { normal: helvetica, bold: helveticaBold, italic: helveticaItalic, boldItalic: helveticaBoldItalic },
    verdana: { normal: helvetica, bold: helveticaBold, italic: helveticaItalic, boldItalic: helveticaBoldItalic },
    "times new roman": { normal: timesRoman, bold: timesRomanBold, italic: timesRomanItalic, boldItalic: timesRomanBoldItalic },
    times: { normal: timesRoman, bold: timesRomanBold, italic: timesRomanItalic, boldItalic: timesRomanBoldItalic },
    georgia: { normal: timesRoman, bold: timesRomanBold, italic: timesRomanItalic, boldItalic: timesRomanBoldItalic },
    courier: { normal: courier, bold: courierBold, italic: courierItalic, boldItalic: courierBoldItalic },
    "courier new": { normal: courier, bold: courierBold, italic: courierItalic, boldItalic: courierBoldItalic },
    monospace: { normal: courier, bold: courierBold, italic: courierItalic, boldItalic: courierBoldItalic },
  }

  function getFont(fontFamily: string, bold: boolean, italic: boolean) {
    const family = fontMap[fontFamily.toLowerCase()] || fontMap.helvetica
    if (bold && italic) return family.boldItalic
    if (bold) return family.bold
    if (italic) return family.italic
    return family.normal
  }

  for (const item of editedItems) {
    const page = pages[item.pageIndex]
    if (!page) continue

    const pdfX = item.pdfX
    const pdfY = item.pdfY
    const pdfFontSize = item.pdfFontSize
    const originalWidth = item.pdfWidth + 20
    const originalHeight = pdfFontSize * 1.4

    page.drawRectangle({
      x: pdfX - 2,
      y: pdfY - pdfFontSize * 0.3,
      width: originalWidth,
      height: originalHeight,
      color: rgb(1, 1, 1),
    })

    const plainText = getPlainTextFromHtml(item.str)
    if (!plainText.trim()) continue

    const segments = parseHtmlToSegments(item.str)
    let currentX = pdfX

    for (const segment of segments) {
      if (!segment.text) continue

      const sanitizedText = segment.text.replace(/[^\x00-\xFF]/g, "")
      if (!sanitizedText) continue

      try {
        const font = getFont(segment.fontFamily, segment.bold, segment.italic)
        const segmentFontSize = segment.fontSize !== null ? segment.fontSize : pdfFontSize

        const textColor = hexToRgb(segment.color)
        const textWidth = font.widthOfTextAtSize(sanitizedText, segmentFontSize)

        if (segment.backgroundColor) {
          const bgColor = hexToRgb(segment.backgroundColor)
          page.drawRectangle({
            x: currentX,
            y: pdfY - segmentFontSize * 0.2,
            width: textWidth,
            height: segmentFontSize * 1.2,
            color: rgb(bgColor.r, bgColor.g, bgColor.b),
            opacity: 0.5,
          })
        }

        page.drawText(sanitizedText, {
          x: currentX,
          y: pdfY,
          size: segmentFontSize,
          font,
          color: rgb(textColor.r, textColor.g, textColor.b),
        })

        if (segment.underline) {
          page.drawLine({
            start: { x: currentX, y: pdfY - 2 },
            end: { x: currentX + textWidth, y: pdfY - 2 },
            thickness: segmentFontSize * 0.05,
            color: rgb(textColor.r, textColor.g, textColor.b),
          })
        }

        currentX += textWidth
      } catch (e) {
        console.error("failed to render text segment", e)
      }
    }
  }

  for (const sig of signatures) {
    const page = pages[sig.pageIndex]
    if (!page) continue

    try {
      const base64Data = sig.dataUrl.split(",")[1]
      const bytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))
      const embedded = await pdf.embedPng(bytes)

      page.drawImage(embedded, {
        x: sig.pdfX,
        y: sig.pdfY,
        width: sig.pdfWidth,
        height: sig.pdfHeight,
      })
    } catch (e) {
      console.error("failed to embed signature", e)
    }
  }

  for (const img of images) {
    const page = pages[img.pageIndex]
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
        embedded = await pdf.embedPng(bytes)
      }

      page.drawImage(embedded, {
        x: img.pdfX,
        y: img.pdfY,
        width: img.pdfWidth,
        height: img.pdfHeight,
      })
    } catch (e) {
      console.error("failed to embed image", e)
    }
  }

  for (const [pageIndexStr, rotation] of Object.entries(pageRotations)) {
    const pageIndex = parseInt(pageIndexStr)
    const page = pages[pageIndex]
    if (!page || rotation === 0) continue
    page.setRotation(degrees(rotation))
  }

  const hasReorder = pageOrder.length > 0 && pageOrder.some((p, i) => p !== i)

  if (hasReorder || deletedPages.size > 0) {
    const finalPdf = await PDFDocument.create()
    const effectiveOrder = hasReorder ? pageOrder : Array.from({ length: pdf.getPageCount() }, (_, i) => i)
    const indicesToCopy = effectiveOrder.filter(idx => !deletedPages.has(idx))

    if (indicesToCopy.length > 0) {
      const copiedPages = await finalPdf.copyPages(pdf, indicesToCopy)
      for (const page of copiedPages) {
        finalPdf.addPage(page)
      }
    }

    return finalPdf.save()
  }

  return pdf.save()
}
