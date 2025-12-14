import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { validateUploadedFile, generateSecureFilename } from '@/lib/file-validator'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file with comprehensive security checks
    const validation = await validateUploadedFile(file)
    
    if (!validation.isValid) {
      console.warn('File validation failed:', validation.error)
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate secure filename using only validated extension
    const filename = generateSecureFilename(validation.safeExtension!)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filepath = join(uploadsDir, filename)
    
    await writeFile(filepath, buffer)
    console.log('File uploaded successfully:', {
      filename,
      detectedType: validation.detectedType,
      size: file.size,
    })

    // Return public URL
    const url = `/uploads/${filename}`
    return NextResponse.json({ 
      success: true, 
      url,
      detectedType: validation.detectedType,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
