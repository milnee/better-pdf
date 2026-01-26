import * as pdfjs from "pdfjs-dist"

if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"
}

export type PDFDocumentProxy = Awaited<ReturnType<typeof pdfjs.getDocument>["promise"]>
export type PDFPageProxy = Awaited<ReturnType<PDFDocumentProxy["getPage"]>>

export async function loadPdfForRender(file: File): Promise<PDFDocumentProxy> {
  const buffer = await file.arrayBuffer()
  const data = new Uint8Array(buffer)
  return pdfjs.getDocument({ data }).promise
}

export interface RenderOptions {
  scale?: number
  canvas?: HTMLCanvasElement
}

export async function renderPage(
  page: PDFPageProxy,
  options: RenderOptions = {}
): Promise<HTMLCanvasElement> {
  const { scale = 1 } = options
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
  const viewport = page.getViewport({ scale: scale * dpr })

  const canvas = options.canvas || document.createElement("canvas")
  const context = canvas.getContext("2d")
  if (!context) throw new Error("could not get canvas context")

  canvas.width = viewport.width
  canvas.height = viewport.height
  canvas.style.width = `${viewport.width / dpr}px`
  canvas.style.height = `${viewport.height / dpr}px`

  await page.render({
    canvasContext: context,
    viewport,
  }).promise

  return canvas
}

export async function renderPageToDataUrl(
  page: PDFPageProxy,
  options: RenderOptions & { format?: "png" | "jpeg"; quality?: number } = {}
): Promise<string> {
  const { format = "png", quality = 0.92 } = options
  const canvas = await renderPage(page, options)
  return canvas.toDataURL(`image/${format}`, quality)
}

export async function renderAllPages(
  pdf: PDFDocumentProxy,
  options: RenderOptions = {}
): Promise<HTMLCanvasElement[]> {
  const canvases: HTMLCanvasElement[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const canvas = await renderPage(page, options)
    canvases.push(canvas)
  }

  return canvases
}

export async function getPageDimensions(
  page: PDFPageProxy,
  scale = 1
): Promise<{ width: number; height: number }> {
  const viewport = page.getViewport({ scale })
  return { width: viewport.width, height: viewport.height }
}

export async function extractTextFromPdf(file: File): Promise<string[]> {
  const pdf = await loadPdfForRender(file)
  const pages: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const text = (content.items as Array<{ str?: string }>)
      .map((item) => item.str || "")
      .join(" ")
    pages.push(text)
  }

  return pages
}
