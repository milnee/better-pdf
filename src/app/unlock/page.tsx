"use client"

import { useState, useCallback } from "react"
import { Toolbar } from "@/components/layout/toolbar"
import { Dropzone } from "@/components/ui/dropzone"
import { Button } from "@/components/ui/button"
import { downloadBytes } from "@/lib/download"
import { addRecentFile } from "@/components/layout/recent"
import { FileDown, Lock, Unlock, Eye, EyeOff } from "lucide-react"
import { PDFDocument } from "pdf-lib"

export default function UnlockPage() {
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)

  const handleFile = useCallback(async (files: File[]) => {
    const f = files[0]
    if (!f) return

    setFile(f)
    setPassword("")
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
        password: password || undefined,
        ignoreEncryption: true,
      })

      const unlockedBytes = await pdfDoc.save()
      setPdfBytes(unlockedBytes)
      setUnlocked(true)
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "unknown error"
      if (errorMessage.includes("password") || errorMessage.includes("encrypted")) {
        setError("incorrect password. please try again.")
      } else {
        setError("failed to unlock pdf. the file may be corrupted or use unsupported encryption.")
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
    setPassword("")
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
              <p>upload a password-protected pdf to remove its password.</p>
              <p className="mt-2 text-xs">you must know the password to unlock the pdf.</p>
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
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      enter pdf password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                        placeholder="password"
                        className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      leave empty if the pdf only has restrictions (no open password)
                    </p>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500">
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={handleUnlock}
                    disabled={unlocking}
                    className="w-full"
                  >
                    <Unlock className="mr-2 h-4 w-4" />
                    {unlocking ? "unlocking..." : "unlock pdf"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-center">
                    <Unlock className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="font-medium text-green-500">pdf unlocked successfully</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      the password protection has been removed
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
              <p className="font-medium text-foreground mb-2">how it works</p>
              <ul className="space-y-1 text-xs">
                <li>• your pdf is processed entirely in your browser</li>
                <li>• the file is never uploaded to any server</li>
                <li>• you must provide the correct password</li>
                <li>• this tool cannot crack or bypass passwords</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
