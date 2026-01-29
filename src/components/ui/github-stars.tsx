"use client"

import { useEffect, useState } from "react"
import { Github, Star } from "lucide-react"

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
      className="inline-flex items-center gap-2 h-10 px-4 rounded-md border bg-background hover:bg-muted transition-colors text-sm font-medium"
    >
      <Github className="h-4 w-4" />
      <span>Star</span>
      <span className="flex items-center gap-1 pl-2 border-l text-muted-foreground">
        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
        {stars !== null ? stars.toLocaleString() : "—"}
      </span>
    </a>
  )
}
