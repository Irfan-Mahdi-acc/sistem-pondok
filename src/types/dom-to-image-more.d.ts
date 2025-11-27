declare module 'dom-to-image-more' {
  export function toPng(
    node: HTMLElement,
    options?: {
      quality?: number
      bgcolor?: string
      width?: number
      height?: number
      style?: Record<string, string>
      filter?: (node: HTMLElement) => boolean
    }
  ): Promise<string>

  export function toJpeg(
    node: HTMLElement,
    options?: {
      quality?: number
      bgcolor?: string
      style?: Record<string, string>
    }
  ): Promise<string>

  export function toBlob(
    node: HTMLElement,
    options?: {
      quality?: number
      bgcolor?: string
      style?: Record<string, string>
    }
  ): Promise<Blob>

  export function toPixelData(
    node: HTMLElement,
    options?: {
      quality?: number
      bgcolor?: string
      style?: Record<string, string>
    }
  ): Promise<Uint8ClampedArray>

  export function toSvg(
    node: HTMLElement,
    options?: {
      bgcolor?: string
      style?: Record<string, string>
    }
  ): Promise<string>
}
