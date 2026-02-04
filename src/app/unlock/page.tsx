"use client"

import { useState, useCallback } from "react"
import { Toolbar } from "@/components/layout/toolbar"
import { Dropzone } from "@/components/ui/dropzone"
import { Button } from "@/components/ui/button"
import { downloadBytes } from "@/lib/download"
import { addRecentFile } from "@/components/layout/recent"
import { FileDown, Lock, Unlock, AlertCircle, Eye, EyeOff } from "lucide-react"
import { PDFDocument } from "pdf-lib"
import { loadPdfFromBytes, renderPage } from "@/lib/render"

export default function UnlockPage() {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [unlocking, setUnlocking] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [needsPassword, setNeedsPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleFile = useCallback(async (files: File[]) => {
    const f = files[0]
    if (!f) return

    setFile(f)
    setError("")
    setUnlocked(false)
    setPdfBytes(null)
    setNeedsPassword(false)
    setPassword("")
    addRecentFile({ name: f.name, size: f.size }, "unlock pdf", "/unlock")
  }, [])

  const handleUnlock = async () => {
    if (!file) return

    setUnlocking(true)
    setError("")

    try {
      const buffer = await file.arrayBuffer()
      const data = new Uint8Array(buffer)

      if (!password) {
        try {
          const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })
          const unlockedBytes = await pdfDoc.save()
          setPdfBytes(unlockedBytes)
          setUnlocked(true)
          return
        } catch {
          setNeedsPassword(true)
          setUnlocking(false)
          return
        }
      }

      try {
        const pdfDoc = await PDFDocument.load(buffer, { password })
        const unlockedBytes = await pdfDoc.save()
        setPdfBytes(unlockedBytes)
        setUnlocked(true)
        setNeedsPassword(false)
      } catch {
        try {
          const pdf = await loadPdfFromBytes(data, password)
          const newPdf = await PDFDocument.create()

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const viewport = page.getViewport({ scale: 2 })
            const canvas = await renderPage(page, { scale: 2 })
            const imgData = canvas.toDataURL("image/jpeg", 0.95)
            const base64 = imgData.split(",")[1]
            const imgBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
            const img = await newPdf.embedJpg(imgBytes)
            const newPage = newPdf.addPage([viewport.width / 2, viewport.height / 2])
            newPage.drawImage(img, { x: 0, y: 0, width: viewport.width / 2, height: viewport.height / 2 })
          }

          const unlockedBytes = await newPdf.save()
          setPdfBytes(unlockedBytes)
          setUnlocked(true)
          setNeedsPassword(false)
        } catch {
          setError("incorrect password. please try again.")
        }
      }
    } catch {
      setError("failed to process pdf. the file may be corrupted.")
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
              <p>remove restrictions from pdfs so you can edit, print, and copy.</p>
              <p className="mt-2 text-xs">password-protected pdfs require the password to unlock.</p>
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

                  {needsPassword && (
                    <div>
                      <label className="text-sm font-medium">enter pdf password</label>
                      <div className="relative mt-1">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="password"
                          className="w-full rounded-lg border bg-background px-3 py-2 pr-10"
                          onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        this pdf requires a password to open
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleUnlock}
                    disabled={unlocking || (needsPassword && !password)}
                    className="w-full"
                  >
                    <Unlock className="mr-2 h-4 w-4" />
                    {unlocking ? "unlocking..." : needsPassword ? "unlock with password" : "unlock pdf"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-center">
                    <Unlock className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="font-medium text-green-500">pdf unlocked</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      all restrictions have been removed
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
              <p className="font-medium text-foreground mb-2">what this does</p>
              <ul className="space-y-1 text-xs">
                <li>• removes printing restrictions</li>
                <li>• removes editing/modification restrictions</li>
                <li>• removes copy/paste restrictions</li>
              </ul>
              <p className="font-medium text-foreground mt-4 mb-2">note</p>
              <ul className="space-y-1 text-xs">
                <li>• password-protected pdfs require the password to unlock</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
