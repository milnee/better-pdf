import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ToolCard } from "@/components/layout/toolcard"
import { FileStack, Type, Image, Images, Eye, Minimize2, Droplets, PenTool, FileImage, ImageIcon } from "lucide-react"

const tools = [
  {
    title: "merge pdfs",
    description: "combine multiple pdf files into one document",
    href: "/merge",
    icon: FileStack,
  },
  {
    title: "edit pdf",
    description: "edit text and add images to pdf documents",
    href: "/text",
    icon: Type,
  },
  {
    title: "compress pdf",
    description: "reduce pdf file size while maintaining quality",
    href: "/compress",
    icon: Minimize2,
  },
  {
    title: "watermark",
    description: "add text watermarks to all pages",
    href: "/watermark",
    icon: Droplets,
  },
  {
    title: "sign pdf",
    description: "draw and add your signature to documents",
    href: "/sign",
    icon: PenTool,
  },
  {
    title: "pdf to jpg",
    description: "convert pdf pages to jpg images",
    href: "/pdf-to-jpg",
    icon: FileImage,
  },
  {
    title: "jpg to pdf",
    description: "convert images to a pdf document",
    href: "/jpg-to-pdf",
    icon: ImageIcon,
  },
  {
    title: "pdf to images",
    description: "convert pdf pages to png or jpeg images",
    href: "/to-images",
    icon: Image,
  },
  {
    title: "images to pdf",
    description: "combine multiple images into a single pdf",
    href: "/from-images",
    icon: Images,
  },
  {
    title: "preview",
    description: "view and navigate through pdf documents",
    href: "/preview",
    icon: Eye,
  },
]

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              pdf tools that respect your privacy
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              your files never leave your device. all processing happens locally in your browser.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-sm text-green-600 dark:text-green-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              100% client-side · zero uploads · open source
            </div>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tools.map((tool) => (
              <ToolCard key={tool.href} {...tool} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
