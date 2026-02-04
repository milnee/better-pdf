"use client"

import { useState, useCallback } from "react"
import { Toolbar } from "@/components/layout/toolbar"
import { Dropzone } from "@/components/ui/dropzone"
import { Button } from "@/components/ui/button"
import { downloadBytes } from "@/lib/download"
import { addRecentFile } from "@/components/layout/recent"
import { FileDown, Lock, Shield, Eye, EyeOff } from "lucide-react"
import { encryptPDF } from "@pdfsmaller/pdf-encrypt-lite"

export default function ProtectPage() {
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [protecting, setProtecting] = useState(false)
  const [protected_, setProtected] = useState(false)
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)

  const handleFile = useCallback(async (files: File[]) => {
    const f = files[0]
    if (!f) return

    setFile(f)
    setProtected(false)
    setPdfBytes(null)
    setPassword("")
    addRecentFile({ name: f.name, size: f.size }, "protect pdf", "/protect")
  }, [])

  const handleProtect = async () => {
    if (!file || !password) return

    setProtecting(true)

    try {
      const buffer = await file.arrayBuffer()
      const pdfData = new Uint8Array(buffer)
      const encryptedBytes = await encryptPDF(pdfData, password, password)
      setPdfBytes(encryptedBytes)
      setProtected(true)
    } catch {
    }
    setProtecting(false)
  }

  const handleDownload = () => {
    if (!pdfBytes || !file) return
    const name = file.name.replace(".pdf", "-protected.pdf")
    downloadBytes(pdfBytes, name)
  }

  const reset = () => {
    setFile(null)
    setPassword("")
    setProtected(false)
    setPdfBytes(null)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Toolbar title="protect pdf" />

      <main className="container mx-auto flex-1 px-4 py-8">
        {!file ? (
          <div className="mx-auto max-w-2xl">
            <Dropzone onFiles={handleFile} accept=".pdf" />
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>add password protection to your pdf files.</p>
              <p className="mt-2 text-xs">your files are processed locally and never uploaded.</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-md">
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-medium truncate">{file.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              {!protected_ ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">password</label>
                    <div className="relative mt-1">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="enter password"
                        className="w-full rounded-lg border bg-background px-3 py-2 pr-10"
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
                      this password will be required to open the pdf
                    </p>
                  </div>

                  <Button
                    onClick={handleProtect}
                    disabled={protecting || !password}
                    className="w-full"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    {protecting ? "protecting..." : "protect pdf"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-center">
                    <Lock className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="font-medium text-green-500">pdf protected</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      password required to open this pdf
                    </p>
                  </div>

                  <Button onClick={handleDownload} className="w-full">
                    <FileDown className="mr-2 h-4 w-4" />
                    download protected pdf
                  </Button>
                </div>
              )}

              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" onClick={reset} className="w-full">
                  {protected_ ? "protect another pdf" : "choose different file"}
                </Button>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">what this does</p>
              <ul className="space-y-1 text-xs">
                <li>• requires password to open the pdf</li>
                <li>• encrypts pdf contents</li>
                <li>• works with all pdf readers</li>
              </ul>
              <p className="font-medium text-foreground mt-4 mb-2">important</p>
              <ul className="space-y-1 text-xs">
                <li>• don&apos;t forget your password</li>
                <li>• we cannot recover lost passwords</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
