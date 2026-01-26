"use client"

import { useState, useCallback } from "react"
import { Toolbar } from "@/components/layout/toolbar"
import { Dropzone } from "@/components/ui/dropzone"
import { Button } from "@/components/ui/button"
import { downloadBytes } from "@/lib/download"
import { addRecentFile } from "@/components/layout/recent"
import { FileDown, Lock, Unlock, AlertCircle } from "lucide-react"
import { PDFDocument } from "pdf-lib"

export default function UnlockPage() {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [unlocking, setUnlocking] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)

  const handleFile = useCallback(async (files: File[]) => {
    const f = files[0]
    if (!f) return

    setFile(f)
    setError("")
    setUnlocked(false)
    setPdfBytes(null)
    addRecentFile({ name: f.name, size: f.size }, "unlock pdf", "/unlock")
  }, [])

  const handleUnlock = async () => {
    if (!file) return

    setUnlocking(true)
    setError("")

    try {
      const buffer = await file.arrayBuffer()

      const pdfDoc = await PDFDocument.load(buffer, {
        ignoreEncryption: true,
      })

      const unlockedBytes = await pdfDoc.save()
      setPdfBytes(unlockedBytes)
      setUnlocked(true)
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "unknown error"
      if (errorMessage.includes("encrypted") || errorMessage.includes("password")) {
        setError("this pdf requires a password to open. this tool can only remove editing/printing restrictions, not open passwords.")
      } else {
        setError("failed to process pdf. the file may be corrupted.")
      }
      console.error("failed to unlock pdf", e)
    }
    setUnlocking(false)
  }

  const handleDownload = () => {
    if (!pdfBytes || !file) return
    const name = file.name.replace(".pdf", "-unlocked.pdf")
    downloadBytes(pdfBytes, name)
  }

  const reset = () => {
    setFile(null)
    setError("")
    setUnlocked(false)
    setPdfBytes(null)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Toolbar title="unlock pdf" />

      <main className="container mx-auto flex-1 px-4 py-8">
        {!file ? (
          <div className="mx-auto max-w-2xl">
            <Dropzone onFiles={handleFile} accept=".pdf" />
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>remove restrictions from pdfs (printing, editing, copying).</p>
              <p className="mt-2 text-xs">works with pdfs that have owner passwords, not open passwords.</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-md">
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                  <Lock className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-medium truncate">{file.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              {!unlocked ? (
                <div className="space-y-4">
                  {error && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500 flex gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button
                    onClick={handleUnlock}
                    disabled={unlocking}
                    className="w-full"
                  >
                    <Unlock className="mr-2 h-4 w-4" />
                    {unlocking ? "removing restrictions..." : "remove restrictions"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-center">
                    <Unlock className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="font-medium text-green-500">restrictions removed</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      you can now edit, print, and copy from this pdf
                    </p>
                  </div>

                  <Button onClick={handleDownload} className="w-full">
                    <FileDown className="mr-2 h-4 w-4" />
                    download unlocked pdf
                  </Button>
                </div>
              )}

              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" onClick={reset} className="w-full">
                  {unlocked ? "unlock another pdf" : "choose different file"}
                </Button>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">what this removes</p>
              <ul className="space-y-1 text-xs">
                <li>• printing restrictions</li>
                <li>• editing/modification restrictions</li>
                <li>• copy/paste restrictions</li>
                <li>• form filling restrictions</li>
              </ul>
              <p className="font-medium text-foreground mt-4 mb-2">what this cannot do</p>
              <ul className="space-y-1 text-xs">
                <li>• remove passwords required to open a pdf</li>
                <li>• crack or bypass unknown passwords</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
