"use client"

import { useState, useCallback } from "react"
import { Toolbar } from "@/components/layout/toolbar"
import { Dropzone } from "@/components/ui/dropzone"
import { Button } from "@/components/ui/button"
import { addWatermark } from "@/lib/pdf"
import { downloadBytes } from "@/lib/download"

export default function WatermarkPage() {
  const [file, setFile] = useState<File | null>(null)
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL")
  const [opacity, setOpacity] = useState(0.3)
  const [fontSize, setFontSize] = useState(48)
  const [downloading, setDownloading] = useState(false)

  const handleFile = useCallback((files: File[]) => {
    setFile(files[0] || null)
  }, [])

  const handleDownload = useCallback(async () => {
    if (!file || !watermarkText) return

    setDownloading(true)
    try {
      const result = await addWatermark(file, {
        text: watermarkText,
        opacity,
        fontSize,
      })
      const name = file.name.replace(".pdf", "-watermarked.pdf")
      downloadBytes(result, name)
    } catch (e) {
      console.error("failed to add watermark", e)
    }
    setDownloading(false)
  }, [file, watermarkText, opacity, fontSize])

  return (
    <div className="flex min-h-screen flex-col">
      <Toolbar
        title="watermark pdf"
        onDownload={handleDownload}
        downloading={downloading}
        downloadDisabled={!file || !watermarkText}
      />

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Dropzone onFiles={handleFile} accept=".pdf" />

          {file && (
            <div className="mt-8 space-y-6">
              <div className="rounded-lg border p-4">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">watermark text</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="mt-1 w-full rounded border bg-background px-3 py-2"
                    placeholder="enter watermark text"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">opacity ({Math.round(opacity * 100)}%)</label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="mt-1 w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">font size ({fontSize}px)</label>
                  <input
                    type="range"
                    min="24"
                    max="96"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="mt-1 w-full"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-4xl font-bold" style={{ opacity, fontSize: fontSize * 0.5 }}>
                  {watermarkText}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">preview</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
