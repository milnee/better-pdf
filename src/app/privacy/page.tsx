import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import type { Metadata } from "next"
import { Shield, Eye, EyeOff, Database, Lock, Globe, HardDrive, RefreshCw, Mail } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Better PDF privacy policy. Learn how we protect your data and privacy.",
}

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-16 max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                <Shield className="h-6 w-6" />
              </div>
              <span className="text-sm text-muted-foreground uppercase tracking-wider">privacy policy</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">your privacy matters</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              better pdf is built with privacy as a core principle. your files never leave your device.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              last updated: january 26, 2026
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="rounded-xl border bg-green-500/5 border-green-500/20 p-6 mb-12">
            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                  <Lock className="h-5 w-5" />
                </div>
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-2">the short version</h2>
                <p className="text-muted-foreground">
                  better pdf processes all files entirely in your browser. your files never leave your device and are never uploaded to any server. we don&apos;t collect, store, or have access to any of your documents.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <section className="grid md:grid-cols-[200px,1fr] gap-6">
              <div className="flex items-start gap-3">
                <HardDrive className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <h2 className="font-semibold">how it works</h2>
              </div>
              <p className="text-muted-foreground">
                all pdf processing happens locally on your device using javascript. when you upload a file to better pdf, it is processed entirely within your web browser using client-side technologies. at no point is your file transmitted over the internet or stored on any external server.
              </p>
            </section>

            <div className="border-t" />

            <section className="grid md:grid-cols-[200px,1fr] gap-6">
              <div className="flex items-start gap-3">
                <EyeOff className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <h2 className="font-semibold">what we don&apos;t collect</h2>
              </div>
              <div>
                <ul className="space-y-3">
                  {[
                    "your pdf files or any documents you process",
                    "the contents of your files",
                    "personal information from your documents",
                    "file names or metadata",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <div className="border-t" />

            <section className="grid md:grid-cols-[200px,1fr] gap-6">
              <div className="flex items-start gap-3">
                <Eye className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <h2 className="font-semibold">what we may collect</h2>
              </div>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  we may collect anonymous, aggregated analytics data to improve our service:
                </p>
                <ul className="space-y-3">
                  {[
                    "page views and general usage patterns",
                    "browser type and version",
                    "device type (desktop/mobile)",
                    "country-level geographic data",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground/70">
                  this data is anonymized and cannot be used to identify individual users or their documents.
                </p>
              </div>
            </section>

            <div className="border-t" />

            <section className="grid md:grid-cols-[200px,1fr] gap-6">
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <h2 className="font-semibold">local storage</h2>
              </div>
              <p className="text-muted-foreground">
                we use your browser&apos;s local storage to save your preferences (such as theme settings) and recently used files list. this data is stored only on your device and is not transmitted to any server. you can clear this data at any time through your browser settings.
              </p>
            </section>

            <div className="border-t" />

            <section className="grid md:grid-cols-[200px,1fr] gap-6">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <h2 className="font-semibold">third-party services</h2>
              </div>
              <p className="text-muted-foreground">
                better pdf may use third-party services for hosting and analytics. these services have their own privacy policies. we do not share any of your document data with third parties because we never have access to it in the first place.
              </p>
            </section>

            <div className="border-t" />

            <section className="grid md:grid-cols-[200px,1fr] gap-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <h2 className="font-semibold">security</h2>
              </div>
              <p className="text-muted-foreground">
                because your files are processed entirely in your browser and never uploaded to our servers, the security of your documents depends on your own device and browser security. we recommend keeping your browser updated and using trusted devices when working with sensitive documents.
              </p>
            </section>

            <div className="border-t" />

            <section className="grid md:grid-cols-[200px,1fr] gap-6">
              <div className="flex items-start gap-3">
                <RefreshCw className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <h2 className="font-semibold">changes to this policy</h2>
              </div>
              <p className="text-muted-foreground">
                we may update this privacy policy from time to time. any changes will be posted on this page with an updated revision date.
              </p>
            </section>

            <div className="border-t" />

            <section className="grid md:grid-cols-[200px,1fr] gap-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <h2 className="font-semibold">contact</h2>
              </div>
              <p className="text-muted-foreground">
                if you have any questions about this privacy policy, please open an issue on our{" "}
                <a href="https://github.com/milnee/better-pdf" className="text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors" target="_blank" rel="noopener noreferrer">
                  github repository
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
