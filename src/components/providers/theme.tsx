"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark")

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null
    if (stored) {
      setTheme(stored)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement

    const applyTheme = (t: "light" | "dark") => {
      root.classList.remove("light", "dark")
      root.classList.add(t)
      setResolvedTheme(t)
    }

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)")
      applyTheme(media.matches ? "dark" : "light")

      const handler = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? "dark" : "light")
      }
      media.addEventListener("change", handler)
      return () => media.removeEventListener("change", handler)
    }

    applyTheme(theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
