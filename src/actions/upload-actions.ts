'use server'

import fs from 'fs/promises'
import path from 'path'
import { validateUploadedFile, generateSecureFilename } from '@/lib/file-validator'

export async function uploadImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get('file') as File
    
    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    // Validate file with comprehensive security checks
    const validation = await validateUploadedFile(file)
    
    if (!validation.isValid) {
      console.warn('File validation failed:', validation.error)
      return { success: false, error: validation.error }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    try {
      await fs.access(uploadDir)
    } catch {
      await fs.mkdir(uploadDir, { recursive: true })
    }

    // Generate secure filename using only validated extension
    const filename = generateSecureFilename(validation.safeExtension!)
    const filepath = path.join(uploadDir, filename)

    // Write file to disk
    await fs.writeFile(filepath, buffer)

    console.log('File uploaded successfully:', {
      filename,
      detectedType: validation.detectedType,
      size: file.size,
    })

    // Return public URL
    const publicUrl = `/uploads/${filename}`
    
    return { success: true, url: publicUrl }
  } catch (error) {
    console.error('Upload error:', error)
    return { success: false, error: 'Failed to upload file' }
  }
}
