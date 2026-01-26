"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"

interface GitHubStarsProps {
  repo: string
}

export function GitHubStars({ repo }: GitHubStarsProps) {
  const [stars, setStars] = useState<number | null>(null)

  useEffect(() => {
    const cached = sessionStorage.getItem(`github-stars-${repo}`)
    if (cached) {
      setStars(parseInt(cached))
      return
    }

    fetch(`https://api.github.com/repos/${repo}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.stargazers_count !== undefined) {
          setStars(data.stargazers_count)
          sessionStorage.setItem(`github-stars-${repo}`, data.stargazers_count.toString())
        }
      })
      .catch(() => {})
  }, [repo])

  return (
    <a
      href={`https://github.com/${repo}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background hover:bg-muted transition-colors text-sm"
    >
      <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
      <span className="font-medium">
        {stars !== null ? stars.toLocaleString() : "—"}
      </span>
      <span className="text-muted-foreground">stars on GitHub</span>
    </a>
  )
}
