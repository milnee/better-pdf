export interface ImageExportOptions {
  format: "png" | "jpeg"
  quality: number
  scale: number
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: "png" | "jpeg" = "png",
  quality = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error("failed to create blob"))
      },
      `image/${format}`,
      quality
    )
  })
}

export async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export function createThumbnail(
  source: HTMLCanvasElement | HTMLImageElement,
  maxWidth: number,
  maxHeight: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("could not get canvas context")

  let { width, height } = source instanceof HTMLCanvasElement
    ? source
    : { width: source.naturalWidth, height: source.naturalHeight }

  const scale = Math.min(maxWidth / width, maxHeight / height, 1)
  width = Math.floor(width * scale)
  height = Math.floor(height * scale)

  canvas.width = width
  canvas.height = height
  ctx.drawImage(source, 0, 0, width, height)

  return canvas
}

export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export function isValidImageType(file: File): boolean {
  return ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type)
}
