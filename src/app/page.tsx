import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ToolCard } from "@/components/layout/toolcard"
import { RecentFiles } from "@/components/layout/recent"
import { GitHubStars } from "@/components/ui/github-stars"
import { Button } from "@/components/ui/button"
import { DemoPreview } from "@/components/ui/demo-preview"
import Link from "next/link"
import {
  FileStack, Type, Image, Images, Eye, Minimize2, Droplets, PenTool,
  FileImage, ImageIcon, Scissors, Hash, RotateCw, Crop, Unlock,
  Shield, Zap, Lock, ArrowRight
} from "lucide-react"

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
  { title: "merge pdfs", description: "combine multiple pdf files into one document", href: "/merge", icon: FileStack },
  { title: "edit pdf", description: "edit text and add images to pdf documents", href: "/text", icon: Type },
  { title: "split pdf", description: "extract specific pages into a new pdf", href: "/split", icon: Scissors },
  { title: "compress pdf", description: "reduce pdf file size while maintaining quality", href: "/compress", icon: Minimize2 },
  { title: "watermark", description: "add text watermarks to all pages", href: "/watermark", icon: Droplets },
  { title: "sign pdf", description: "draw and add your signature to documents", href: "/sign", icon: PenTool },
  { title: "pdf to jpg", description: "convert pdf pages to jpg images", href: "/pdf-to-jpg", icon: FileImage },
  { title: "jpg to pdf", description: "convert images to a pdf document", href: "/jpg-to-pdf", icon: ImageIcon },
  { title: "pdf to images", description: "convert pdf pages to png or jpeg images", href: "/to-images", icon: Image },
  { title: "images to pdf", description: "combine multiple images into a single pdf", href: "/from-images", icon: Images },
  { title: "page numbers", description: "add page numbers to your pdf", href: "/pagenumbers", icon: Hash },
  { title: "preview", description: "view and navigate through pdf documents", href: "/preview", icon: Eye },
  { title: "rotate pdf", description: "rotate pages 90, 180, or 270 degrees", href: "/rotate", icon: RotateCw },
  { title: "crop pdf", description: "crop and trim pdf page margins", href: "/crop", icon: Crop },
  { title: "unlock pdf", description: "remove password from protected pdfs", href: "/unlock", icon: Unlock },
]

const features = [
  {
    icon: Shield,
    title: "100% Private",
    description: "Files never leave your device. Everything runs in your browser.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "No uploads, no waiting. Process PDFs instantly.",
  },
  {
    icon: Lock,
    title: "No Sign Up",
    description: "No account needed. Just open and start working.",
  },
]

function CornerDecoration({ className }: { className?: string }) {
  return (
    <div className={`absolute text-muted-foreground/30 text-xl font-light select-none ${className}`}>
      +
    </div>
  )
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />

      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm">
          <span className="text-muted-foreground">15 free PDF tools, zero uploads</span>
          <Link href="#tools" className="text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1 transition-colors">
            Explore tools <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <main className="flex-1">
        <section className="relative container mx-auto px-4 pt-16 pb-8 md:pt-24 md:pb-16">
          <div className="absolute inset-0 grid-pattern opacity-50 pointer-events-none" />

          <CornerDecoration className="top-8 left-8 hidden lg:block" />
          <CornerDecoration className="top-8 right-8 hidden lg:block" />
          <CornerDecoration className="bottom-8 left-8 hidden lg:block" />
          <CornerDecoration className="bottom-8 right-8 hidden lg:block" />

          <div className="relative grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
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
              <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                powerful tools that run entirely in your browser. your files never leave your device.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button asChild size="lg" className="gap-2">
                  <Link href="#tools">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <GitHubStars repo="milnee/better-pdf" />
              </div>
            </div>

            <div className="hidden lg:block animate-float">
              <DemoPreview />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="relative flex flex-col items-center text-center p-6 rounded-lg border bg-background/50"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <feature.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="tools" className="container mx-auto px-4 py-12 md:py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold md:text-3xl">All Tools</h2>
            <p className="mt-2 text-muted-foreground">Everything you need to work with PDFs</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool) => (
              <ToolCard key={tool.href} {...tool} />
            ))}
          </div>

          <RecentFiles />
        </section>

        <section className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-16 md:py-24 text-center">
            <h2 className="text-2xl font-bold md:text-4xl mb-4">
              Work with PDFs without compromises
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              No file uploads. No size limits. No waiting. Just powerful PDF tools that respect your privacy.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.251 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.572 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z" />
                </svg>
                <span>Next.js</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" />
                </svg>
                <span>Tailwind</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38a2.167 2.167 0 0 0-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44a23.476 23.476 0 0 0-3.107-.534A23.892 23.892 0 0 0 12.769 4.7c1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442a22.73 22.73 0 0 0-3.113.538 15.02 15.02 0 0 1-.254-1.42c-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.127zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87a25.64 25.64 0 0 1-4.412.005 26.64 26.64 0 0 1-1.183-1.86c-.372-.64-.71-1.29-1.018-1.946a25.17 25.17 0 0 1 1.013-1.954c.38-.66.773-1.286 1.18-1.868A25.245 25.245 0 0 1 12 8.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933a25.952 25.952 0 0 0-1.345-2.32zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493a23.966 23.966 0 0 0-1.1-2.98c.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98a23.142 23.142 0 0 0-1.086 2.964c-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39a25.819 25.819 0 0 0 1.341-2.338zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143a22.005 22.005 0 0 1-2.006-.386c.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295a1.185 1.185 0 0 1-.553-.132c-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z" />
                </svg>
                <span>React 19</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" />
                </svg>
                <span>TypeScript</span>
              </div>
            </div>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <a href="https://github.com/milnee/better-pdf" target="_blank" rel="noopener noreferrer">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                Star on GitHub
              </a>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
