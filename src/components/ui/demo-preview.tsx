"use client"

import { useState } from "react"
import Link from "next/link"

export function DemoPreview() {
  const [activeTab, setActiveTab] = useState<"merge" | "output">("merge")

  return (
    <div className="relative">
      <div className="rounded-lg border bg-muted/30 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex gap-1 ml-4">
              <button
                onClick={() => setActiveTab("merge")}
                className={`text-xs px-2.5 py-1 rounded transition-colors ${
                  activeTab === "merge"
                    ? "bg-background border text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                merge.ts
              </button>
              <button
                onClick={() => setActiveTab("output")}
                className={`text-xs px-2.5 py-1 rounded transition-colors ${
                  activeTab === "output"
                    ? "bg-background border text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                output.ts
              </button>
            </div>
          </div>
          <button
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Copy code"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>
        <div className="p-6 font-mono text-sm">
          {activeTab === "merge" ? (
            <div className="flex gap-4 text-muted-foreground">
              <div className="flex flex-col items-end select-none">
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <span key={n} className="leading-6">{String(n).padStart(2, "0")}</span>
                ))}
              </div>
              <div className="flex flex-col">
                <span className="leading-6"><span className="text-pink-500">import</span> {"{"} mergePDFs {"}"} <span className="text-pink-500">from</span> <span className="text-cyan-400">&quot;better-pdf&quot;</span></span>
                <span className="leading-6" />
                <span className="leading-6"><span className="text-purple-400">const</span> files = [<span className="text-cyan-400">&quot;doc1.pdf&quot;</span>, <span className="text-cyan-400">&quot;doc2.pdf&quot;</span>]</span>
                <span className="leading-6"><span className="text-purple-400">const</span> merged = <span className="text-pink-500">await</span> mergePDFs(files)</span>
                <span className="leading-6" />
                <span className="leading-6 text-muted-foreground">{"// "}Your files never leave your device</span>
                <span className="leading-6">download(merged, <span className="text-cyan-400">&quot;combined.pdf&quot;</span>)</span>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 text-muted-foreground">
              <div className="flex flex-col items-end select-none">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <span key={n} className="leading-6">{String(n).padStart(2, "0")}</span>
                ))}
              </div>
              <div className="flex flex-col">
                <span className="leading-6 text-muted-foreground">{"// "}combined.pdf generated</span>
                <span className="leading-6" />
                <span className="leading-6">{"{"}</span>
                <span className="leading-6">  <span className="text-pink-500">name</span>: <span className="text-cyan-400">&quot;combined.pdf&quot;</span>,</span>
                <span className="leading-6">  <span className="text-pink-500">pages</span>: <span className="text-purple-400">12</span>,</span>
                <span className="leading-6">  <span className="text-pink-500">size</span>: <span className="text-cyan-400">&quot;2.4 MB&quot;</span>,</span>
                <span className="leading-6">  <span className="text-pink-500">status</span>: <span className="text-green-400">&quot;ready&quot;</span></span>
                <span className="leading-6">{"}"}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end mt-3">
        <Link
          href="/merge"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border bg-background hover:bg-muted transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Try Demo
        </Link>
      </div>
    </div>
  )
}
