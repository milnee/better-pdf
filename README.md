<div align="center">
  <img src="src/app/icon.svg" alt="Better PDF" width="80" height="80" />
  <h1>Better PDF</h1>
  <p><strong>Free, private PDF tools that run entirely in your browser</strong></p>
  <p>
    <a href="https://better-pdf.com">Website</a> •
    <a href="#features">Features</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#tech-stack">Tech Stack</a>
  </p>
  <p>
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
    <img src="https://img.shields.io/badge/100%25-private-green.svg" alt="100% Private" />
  </p>
</div>

<br />

<p align="center">
  <img src="https://raw.githubusercontent.com/milnee/better-pdf/main/preview.png?v=2" alt="Better PDF Preview" width="100%" />
</p>

## Why Better PDF?

Most online PDF tools upload your files to their servers. **Better PDF is different** — all processing happens locally in your browser. Your files never leave your device.

- **100% Private** — Files never uploaded to any server
- **Lightning Fast** — No upload/download wait times
- **Completely Free** — No limits, no watermarks, no signup
- **Open Source** — Audit the code yourself

## Features

| Tool | Description |
|------|-------------|
| **Merge PDFs** | Combine multiple PDF files into one |
| **Edit PDF** | Edit text and add images to documents |
| **Split PDF** | Extract specific pages or page ranges |
| **Compress PDF** | Reduce file size with quality options |
| **Rotate PDF** | Rotate pages 90, 180, or 270 degrees |
| **Crop PDF** | Crop and trim page margins |
| **Unlock PDF** | Remove restrictions from PDFs |
| **Protect PDF** | Add password protection |
| **Watermark** | Add text watermarks (single or diagonal) |
| **Sign PDF** | Draw and place your signature |
| **PDF to JPG** | Convert pages to JPG images |
| **JPG to PDF** | Convert images to PDF |
| **PDF to Images** | Export as PNG or JPEG |
| **Images to PDF** | Combine multiple images into PDF |
| **Page Numbers** | Add customizable page numbers |
| **Preview** | View and navigate PDF documents |

### Additional Features

- **Drag & Drop** — Reorder pages by dragging thumbnails
- **Recent Files** — Quick access to recently used files
- **Dark Mode** — Easy on the eyes
- **Mobile Responsive** — Works on all devices
- **100MB File Limit** — Handles large documents

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+

### Installation

```bash
# Clone the repository
git clone https://github.com/milnee/better-pdf.git
cd better-pdf

# Install dependencies
bun install

# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
bun run build
bun start
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Next.js 15](https://nextjs.org/) with App Router |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Runtime | [Bun](https://bun.sh/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| PDF Processing | [pdf-lib](https://pdf-lib.js.org/) |
| PDF Rendering | [PDF.js](https://mozilla.github.io/pdf.js/) |
| Icons | [Lucide](https://lucide.dev/) |
| Analytics | [Vercel Analytics](https://vercel.com/analytics) |

## Privacy & Security

- **Zero Server Processing** — All PDF operations run in your browser
- **No File Uploads** — Your documents never leave your device
- **No Account Required** — Just open and use
- **Open Source** — Fully transparent codebase

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Firefox | 90+ |
| Safari | 15+ |
| Edge | 90+ |

## License

MIT License — free for personal and commercial use.

---

<div align="center">
  <p><strong>Your documents. Your device. Your control.</strong></p>
  <p><a href="https://better-pdf.com">better-pdf.com</a></p>
</div>
