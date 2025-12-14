/**
 * Secure File Validation Utility
 * 
 * Provides comprehensive file validation including:
 * - Magic bytes verification (actual file content)
 * - Extension whitelist
 * - MIME type validation
 * - File size limits
 */

export interface FileValidationResult {
  isValid: boolean
  error?: string
  safeExtension?: string
  detectedType?: string
}

// Magic bytes signatures for common image formats
const MAGIC_BYTES = {
  jpeg: [
    [0xFF, 0xD8, 0xFF], // JPEG
  ],
  png: [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], // PNG
  ],
  gif: [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  webp: [
    // WebP: RIFF....WEBP (check at offset 0 and 8)
    [0x52, 0x49, 0x46, 0x46], // RIFF at start
  ],
  svg: [
    [0x3C, 0x73, 0x76, 0x67], // <svg
    [0x3C, 0x3F, 0x78, 0x6D, 0x6C], // <?xml
  ],
}

// Allowed image extensions
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

/**
 * Check if buffer starts with any of the given magic byte sequences
 */
function matchesMagicBytes(buffer: Buffer, signatures: number[][]): boolean {
  return signatures.some(signature => {
    if (buffer.length < signature.length) return false
    return signature.every((byte, index) => buffer[index] === byte)
  })
}

/**
 * Detect file type from magic bytes
 */
function detectFileType(buffer: Buffer): string | null {
  // Check JPEG
  if (matchesMagicBytes(buffer, MAGIC_BYTES.jpeg)) {
    return 'jpeg'
  }
  
  // Check PNG
  if (matchesMagicBytes(buffer, MAGIC_BYTES.png)) {
    return 'png'
  }
  
  // Check GIF
  if (matchesMagicBytes(buffer, MAGIC_BYTES.gif)) {
    return 'gif'
  }
  
  // Check WebP (RIFF at start, WEBP at offset 8)
  if (matchesMagicBytes(buffer, MAGIC_BYTES.webp)) {
    if (buffer.length >= 12) {
      const webpSignature = [0x57, 0x45, 0x42, 0x50] // WEBP
      const webpMatch = webpSignature.every((byte, index) => buffer[8 + index] === byte)
      if (webpMatch) return 'webp'
    }
  }
  
  // Check SVG
  if (matchesMagicBytes(buffer, MAGIC_BYTES.svg)) {
    return 'svg'
  }
  
  return null
}

/**
 * Get safe extension from detected file type
 */
function getSafeExtension(detectedType: string): string {
  const extensionMap: Record<string, string> = {
    'jpeg': 'jpg',
    'png': 'png',
    'gif': 'gif',
    'webp': 'webp',
    'svg': 'svg',
  }
  return extensionMap[detectedType] || 'bin'
}

/**
 * Validate uploaded file with comprehensive security checks
 */
export async function validateUploadedFile(file: File): Promise<FileValidationResult> {
  try {
    // 1. Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      }
    }

    // 2. Check if file is empty
    if (file.size === 0) {
      return {
        isValid: false,
        error: 'File is empty',
      }
    }

    // 3. Read file buffer for magic bytes validation
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 4. Detect actual file type from magic bytes
    const detectedType = detectFileType(buffer)
    
    if (!detectedType) {
      return {
        isValid: false,
        error: 'File type not recognized. Only images (JPEG, PNG, GIF, WebP, SVG) are allowed.',
      }
    }

    // 5. Verify MIME type matches detected type
    const expectedMimeTypes: Record<string, string[]> = {
      'jpeg': ['image/jpeg', 'image/jpg'],
      'png': ['image/png'],
      'gif': ['image/gif'],
      'webp': ['image/webp'],
      'svg': ['image/svg+xml'],
    }

    const allowedMimes = expectedMimeTypes[detectedType] || []
    if (!allowedMimes.includes(file.type)) {
      return {
        isValid: false,
        error: `MIME type mismatch. File appears to be ${detectedType} but MIME type is ${file.type}`,
      }
    }

    // 6. Get safe extension
    const safeExtension = getSafeExtension(detectedType)

    // 7. Additional SVG security check (prevent XSS)
    if (detectedType === 'svg') {
      const svgContent = buffer.toString('utf-8')
      
      // Check for dangerous SVG content
      const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i, // onclick, onload, etc.
        /<iframe/i,
        /<embed/i,
        /<object/i,
      ]

      for (const pattern of dangerousPatterns) {
        if (pattern.test(svgContent)) {
          return {
            isValid: false,
            error: 'SVG file contains potentially dangerous content',
          }
        }
      }
    }

    // All checks passed
    return {
      isValid: true,
      safeExtension,
      detectedType,
    }

  } catch (error) {
    console.error('File validation error:', error)
    return {
      isValid: false,
      error: 'Failed to validate file',
    }
  }
}

/**
 * Validate file extension against whitelist
 */
export function isAllowedExtension(extension: string): boolean {
  return ALLOWED_EXTENSIONS.includes(extension.toLowerCase())
}

/**
 * Generate secure filename
 * - Uses timestamp for uniqueness
 * - Adds random string for additional entropy
 * - Only uses validated safe extension
 */
export function generateSecureFilename(safeExtension: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${randomString}.${safeExtension}`
}
