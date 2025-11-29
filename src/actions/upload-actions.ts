'use server'

export async function uploadImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get('file') as File
    
    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File must be an image' }
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'File size must be less than 5MB' }
    }

    // Create new FormData for API request
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)

    // Call the upload API route
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      body: uploadFormData,
    })

    const result = await response.json()
    
    if (!response.ok || !result.success) {
      console.error('Upload API error:', result.error)
      return { success: false, error: result.error || 'Failed to upload file' }
    }

    return { success: true, url: result.url }
  } catch (error) {
    console.error('Upload error:', error)
    return { success: false, error: 'Failed to upload file' }
  }
}
