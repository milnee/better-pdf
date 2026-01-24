export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function downloadBytes(bytes: Uint8Array, filename: string, type = "application/pdf"): void {
  const blob = new Blob([bytes], { type })
  downloadBlob(blob, filename)
}

export async function downloadCanvasAsImage(
  canvas: HTMLCanvasElement,
  filename: string,
  format: "png" | "jpeg" = "png",
  quality = 0.92
): Promise<void> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          downloadBlob(blob, filename)
          resolve()
        } else {
          reject(new Error("failed to create blob"))
        }
      },
      `image/${format}`,
      quality
    )
  })
}

export async function downloadMultipleAsZip(
  files: { name: string; blob: Blob }[]
): Promise<void> {
  const { default: JSZip } = await import("jszip")
  const zip = new JSZip()

  for (const file of files) {
    zip.file(file.name, file.blob)
  }

  const content = await zip.generateAsync({ type: "blob" })
  downloadBlob(content, "images.zip")
}
