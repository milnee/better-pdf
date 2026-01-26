import { MetadataRoute } from "next"

const baseUrl = "https://better-pdf.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = [
    { path: "/merge", priority: 0.9 },
    { path: "/text", priority: 0.9 },
    { path: "/split", priority: 0.9 },
    { path: "/compress", priority: 0.9 },
    { path: "/rotate", priority: 0.8 },
    { path: "/crop", priority: 0.8 },
    { path: "/unlock", priority: 0.8 },
    { path: "/watermark", priority: 0.8 },
    { path: "/sign", priority: 0.8 },
    { path: "/pdf-to-jpg", priority: 0.8 },
    { path: "/jpg-to-pdf", priority: 0.8 },
    { path: "/to-images", priority: 0.7 },
    { path: "/from-images", priority: 0.7 },
    { path: "/pagenumbers", priority: 0.7 },
    { path: "/preview", priority: 0.6 },
    { path: "/privacy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
  ]

  const currentDate = new Date()

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...tools.map((tool) => ({
      url: `${baseUrl}${tool.path}`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: tool.priority,
    })),
  ]
}
