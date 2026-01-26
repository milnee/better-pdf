"use client"

import { useState, useCallback } from "react"
import { Toolbar } from "@/components/layout/toolbar"
import { Dropzone } from "@/components/ui/dropzone"
import { Button } from "@/components/ui/button"
import { downloadBytes } from "@/lib/download"
import { addRecentFile } from "@/components/layout/recent"
import { FileDown, Lock, Unlock, Eye, EyeOff } from "lucide-react"
import { PDFDocument } from "pdf-lib"

export default function ProtectPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [mode, setMode] = useState<"add" | "remove">("add")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [error, setError] = useState("")

  const handleFile = useCallback(async (files: File[]) => {
    const f = files[0]
    if (!f) return
    setFile(f)
    setError("")
    addRecentFile({ name: f.name, size: f.size }, "protect pdf", "/protect")
  }, [])

  const handleAddPassword = async () => {
    if (!file) return
    if (!password) {
      setError("please enter a password")
      return
    }
    if (password !== confirmPassword) {
      setError("passwords do not match")
      return
    }
    if (password.length < 4) {
      setError("password must be at least 4 characters")
      return
    }

    setProcessing(true)
    setError("")

    try {
      const buffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true })

      const encrypted = await pdf.save({
        userPassword: password,
        ownerPassword: password,
      })

      const name = file.name.replace(".pdf", "-protected.pdf")
      downloadBytes(encrypted, name)
    } catch (e) {
      console.error("failed to protect pdf", e)
      setError("failed to add password. the file may already be encrypted.")
    }

    setProcessing(false)
  }

  const handleRemovePassword = async () => {
    if (!file) return
    if (!currentPassword) {
      setError("please enter the current password")
      return
    }

    setProcessing(true)
    setError("")

    try {
      const buffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(buffer, {
        password: currentPassword,
        ignoreEncryption: false,
      })

      const decrypted = await pdf.save()
      const name = file.name.replace(".pdf", "-unprotected.pdf")
      downloadBytes(decrypted, name)
    } catch (e) {
      console.error("failed to remove password", e)
      setError("incorrect password or unable to decrypt pdf")
    }

    setProcessing(false)
  }

  const reset = () => {
    setFile(null)
    setPassword("")
    setConfirmPassword("")
    setCurrentPassword("")
    setError("")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Toolbar title="protect pdf" />

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-xl">
          {!file ? (
            <>
              <div className="flex gap-2 mb-6 justify-center">
                <Button
                  variant={mode === "add" ? "default" : "outline"}
                  onClick={() => setMode("add")}
                  className="gap-2"
                >
                  <Lock className="h-4 w-4" />
                  add password
                </Button>
                <Button
                  variant={mode === "remove" ? "default" : "outline"}
                  onClick={() => setMode("remove")}
                  className="gap-2"
                >
                  <Unlock className="h-4 w-4" />
                  remove password
                </Button>
              </div>

              <Dropzone onFiles={handleFile} accept=".pdf" />
              {loading && (
                <p className="mt-4 text-center text-muted-foreground">loading...</p>
              )}
              <div className="mt-8 text-center text-sm text-muted-foreground">
                {mode === "add" ? (
                  <p>upload a pdf to add password protection.</p>
                ) : (
                  <p>upload a password-protected pdf to remove the password.</p>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-lg border p-6">
              <div className="flex items-center gap-3 mb-6">
                {mode === "add" ? (
                  <Lock className="h-8 w-8 text-green-500" />
                ) : (
                  <Unlock className="h-8 w-8 text-orange-500" />
                )}
                <div>
                  <h2 className="font-medium">{file.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {mode === "add" ? "add password protection" : "remove password protection"}
                  </p>
                </div>
              </div>

              {mode === "add" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="enter password"
                        className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">confirm password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="confirm password"
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1">current password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="enter current password"
                      className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <p className="mt-4 text-sm text-red-500">{error}</p>
              )}

              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={reset} className="flex-1">
                  cancel
                </Button>
                <Button
                  onClick={mode === "add" ? handleAddPassword : handleRemovePassword}
                  disabled={processing}
                  className="flex-1 gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  {processing ? "processing..." : mode === "add" ? "protect & download" : "unlock & download"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
