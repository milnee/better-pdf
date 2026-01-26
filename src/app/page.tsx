import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ToolCard } from "@/components/layout/toolcard"
import { RecentFiles } from "@/components/layout/recent"
import { FileStack, Type, Image, Images, Eye, Minimize2, Droplets, PenTool, FileImage, ImageIcon, Scissors, Lock, Hash } from "lucide-react"

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Better PDF really free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Better PDF is 100% free to use. All PDF tools are available without any cost, registration, or hidden fees.",
      },
    },
    {
      "@type": "Question",
      name: "Are my files safe and private?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. Better PDF runs entirely in your browser. Your files never leave your device and are never uploaded to any server.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to create an account?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No account or registration is required. Simply visit the website and start using any PDF tool immediately.",
      },
    },
    {
      "@type": "Question",
      name: "What PDF tools are available?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Better PDF offers: Merge PDFs, Split PDF, Compress PDF, Edit PDF, PDF to Images, Images to PDF, Add Watermark, Password Protection, and Add Page Numbers.",
      },
    },
    {
      "@type": "Question",
      name: "Does Better PDF work on mobile?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Better PDF is fully responsive and works on smartphones and tablets.",
      },
    },
  ],
}

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
    title: "split pdf",
    description: "extract specific pages into a new pdf",
    href: "/split",
    icon: Scissors,
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
    title: "protect pdf",
    description: "add or remove password protection",
    href: "/protect",
    icon: Lock,
  },
  {
    title: "page numbers",
    description: "add page numbers to your pdf",
    href: "/pagenumbers",
    icon: Hash,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 pt-16 pb-8 md:pt-24 md:pb-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 border border-dashed px-3 py-1.5 text-xs uppercase tracking-widest text-muted-foreground mb-6">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
              </span>
              free · private · open source
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              a better way to
              <br />
              <span className="text-muted-foreground">work with pdfs</span>
            </h1>
            <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
              powerful tools that run entirely in your browser. your files never leave your device.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool) => (
              <ToolCard key={tool.href} {...tool} />
            ))}
          </div>

          <RecentFiles />
        </section>
      </main>
      <Footer />
    </>
  )
}
