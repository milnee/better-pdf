export interface PageInfo {
  pageNumber: number
  width: number
  height: number
}

export interface TextAnnotation {
  id: string
  text: string
  x: number
  y: number
  size: number
  color: string
  pageIndex: number
}

export type PageSize = "fit" | "a4" | "letter"

export type ImageFormat = "png" | "jpeg"

export interface ExportSettings {
  format: ImageFormat
  quality: number
  scale: number
}
