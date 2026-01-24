# PDFKit

A powerful, privacy-focused PDF toolkit that runs entirely in your browser. No file uploads, no servers, no data collection - all processing happens locally on your device.

## Features

| Tool | Description |
|------|-------------|
| **Merge PDFs** | Combine multiple PDF files into a single document with drag-and-drop reordering |
| **Edit PDF** | Edit existing text, add new text boxes, and paste images onto PDF pages |
| **Compress PDF** | Reduce PDF file size while maintaining quality |
| **Watermark** | Add customizable text watermarks with adjustable opacity and size |
| **Sign PDF** | Draw your signature and place it anywhere on the document |
| **PDF to JPG** | Convert PDF pages to high-quality JPG images |
| **JPG to PDF** | Convert multiple images into a single PDF document |
| **PDF to Images** | Export PDF pages as PNG or JPEG with quality options |
| **Images to PDF** | Combine images with customizable page sizes (A4, Letter, Fit) |
| **Preview** | View and navigate through PDF documents |

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Runtime**: [Bun](https://bun.sh/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **PDF Processing**: [pdf-lib](https://pdf-lib.js.org/) for manipulation, [PDF.js](https://mozilla.github.io/pdf.js/) for rendering
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linting**: [Biome](https://biomejs.dev/)

## Privacy & Security

- **100% Client-Side**: All PDF processing happens in your browser using WebAssembly and JavaScript
- **Zero Uploads**: Your files never leave your device
- **No Analytics**: No tracking, no cookies, no data collection
- **Open Source**: Full transparency - audit the code yourself

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+

### Installation

```bash
# Clone the repository
git clone https://github.com/milnee/pdfkit.git
cd pdfkit

# Install dependencies
bun install

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
bun run build
bun run start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── compress/          # PDF compression
│   ├── from-images/       # Images to PDF
│   ├── jpg-to-pdf/        # JPG to PDF conversion
│   ├── merge/             # PDF merging
│   ├── pdf-to-jpg/        # PDF to JPG conversion
│   ├── preview/           # PDF viewer
│   ├── sign/              # PDF signing
│   ├── text/              # PDF editing
│   ├── to-images/         # PDF to images
│   └── watermark/         # Watermark tool
├── components/
│   ├── layout/            # Header, footer, toolbar
│   ├── pdf/               # PDF viewer, thumbnails
│   ├── providers/         # Theme provider
│   └── ui/                # Reusable UI components
├── lib/
│   ├── pdf.ts             # PDF manipulation utilities
│   ├── render.ts          # PDF rendering with PDF.js
│   ├── download.ts        # File download helpers
│   └── images.ts          # Image processing
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript definitions
```

## Key Technical Decisions

1. **Client-Side Processing**: Uses WebAssembly-powered libraries for PDF manipulation without server roundtrips
2. **Streaming Renders**: PDF pages are rendered progressively for better UX on large documents
3. **Memory Efficient**: Processes pages one at a time to handle large PDFs without memory issues
4. **Type Safety**: Full TypeScript coverage with strict mode enabled
5. **Modern Tooling**: Bun for fast installs and Biome for lightning-fast linting

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

---

Built with privacy in mind. Your documents, your device, your control.
