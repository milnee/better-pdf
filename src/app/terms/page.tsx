import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import type { Metadata } from "next"
import { FileText, AlertTriangle, Scale, UserCheck, ShieldX, BookOpen, RefreshCw, Mail, Gavel } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Better PDF terms of service. Read our terms and conditions for using the service.",
}

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-16 max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-sm text-muted-foreground uppercase tracking-wider">terms of service</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">terms of service</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              please read these terms carefully before using better pdf.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              last updated: january 26, 2026
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="rounded-xl border bg-amber-500/5 border-amber-500/20 p-6 mb-12">
            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-2">important notice</h2>
                <p className="text-muted-foreground">
                  by accessing and using better pdf, you accept and agree to be bound by these terms of service. if you do not agree to these terms, please do not use the service.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <section className="grid md:grid-cols-[200px,1fr] gap-6">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <h2 className="font-semibold">description of service</h2>
              </div>
              <p className="text-muted-foreground">
                better pdf is a free, browser-based pdf tool that allows you to merge, split, compress, edit, and perform other operations on pdf documents. all processing occurs locally in your web browser.
              </p>
            </section>

            <div className="border-t" />

            <section className="grid md:grid-cols-[200px,1fr] gap-6">
              <div className="flex items-start gap-3">
                <ShieldX className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <h2 className="font-semibold">disclaimer of warranties</h2>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4 text-sm">
                  <p className="font-medium mb-3">
                    THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                  </p>
                </div>
                <p className="text-muted-foreground">this includes but is not limited to:</p>
                <ul className="space-y-3">
                  {[
                    "implied warranties of merchantability",
                    "fitness for a particular purpose",
                    "non-infringement",
                    "accuracy or completeness of results",
                    "that the service will be uninterrupted or error-free",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <div className="border-t" />

            <section className="grid md:grid-cols-[200px,1fr] gap-6">
              <div className="flex items-start gap-3">
                <Scale className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <h2 className="font-semibold">limitation of liability</h2>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-4 text-sm">
                  <p className="font-medium text-red-400">
                    TO THE FULLEST EXTENT PERMITTED BY LAW, BETTER PDF AND ITS OWNERS SHALL NOT BE LIABLE FOR ANY DAMAGES WHATSOEVER.
                  </p>
                </div>
                <p className="text-muted-foreground">this includes:</p>
                <ul className="space-y-3">
                  {[
                    "direct, indirect, incidental, special, consequential, or punitive damages",
                    "loss of profits, data, use, goodwill, or other intangible losses",
                    "damages resulting from your use or inability to use the service",
                    "damages resulting from any content obtained from the service",
                    "unauthorized access to or alteration of your data",
                    "errors, mistakes, or inaccuracies in the service",
                    "personal injury or property damage resulting from use of the service",
                    "bugs, viruses, or other harmful code transmitted through the service",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground/70">
                  this limitation applies regardless of the legal theory on which the claim is based, including negligence.
                </p>
              </div>
            </section>

            <div className="border-t" />

            <section className="grid md:grid-cols-[200px,1fr] gap-6">
              <div className="flex items-start gap-3">
                <UserCheck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <h2 className="font-semibold">user responsibilities</h2>
              </div>
              <div className="space-y-4">
                <p className="text-muted-foreground">you are solely responsible for:</p>
                <ul className="space-y-3">
                  {[
                    "the content of any files you process using the service",
                    "ensuring you have the right to process and modify any documents",
                    "backing up your original files before processing",
                    "verifying the output of any operations performed by the service",
                    "complying with all applicable laws and regulations",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <div className="border-t" />

            <section className="grid md:grid-cols-[200px,1fr] gap-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <h2 className="font-semibold">no professional advice</h2>
              </div>
              <p className="text-muted-foreground">
                the service does not provide legal, financial, medical, or other professional advice. any output from the service should not be relied upon as a substitute for professional consultation.
              </p>
            </section>

            <div className="border-t" />

            <section className="grid md:grid-cols-[200px,1fr] gap-6">
              <div className="flex items-start gap-3">
                <Gavel className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <h2 className="font-semibold">indemnification</h2>
              </div>
              <p className="text-muted-foreground">
                you agree to defend, indemnify, and hold harmless better pdf, its owners, operators, and contributors from any claims, damages, losses, liabilities, costs, or expenses (including reasonable attorneys&apos; fees) arising out of or related to your use of the service or violation of these terms.
              </p>
            </section>

            <div className="border-t" />

            <section className="grid md:grid-cols-[200px,1fr] gap-6">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <h2 className="font-semibold">intellectual property</h2>
              </div>
              <p className="text-muted-foreground">
                better pdf is open source software. the source code is available under the terms specified in the project&apos;s repository. you retain all rights to your own documents and files.
              </p>
            </section>

            <div className="border-t" />

            <section className="grid md:grid-cols-[200px,1fr] gap-6">
              <div className="flex items-start gap-3">
                <RefreshCw className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <h2 className="font-semibold">modifications</h2>
              </div>
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  we reserve the right to modify, suspend, or discontinue the service at any time without notice. we may update these terms from time to time.
                </p>
                <p className="text-muted-foreground">
                  continued use of the service after any changes constitutes acceptance of the new terms.
                </p>
              </div>
            </section>

            <div className="border-t" />

            <section className="grid md:grid-cols-[200px,1fr] gap-6">
              <div className="flex items-start gap-3">
                <Scale className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <h2 className="font-semibold">governing law</h2>
              </div>
              <p className="text-muted-foreground">
                these terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. if any provision is found unenforceable, the remaining provisions will continue in full force and effect.
              </p>
            </section>

            <div className="border-t" />

            <section className="grid md:grid-cols-[200px,1fr] gap-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <h2 className="font-semibold">contact</h2>
              </div>
              <p className="text-muted-foreground">
                if you have any questions about these terms, please open an issue on our{" "}
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
