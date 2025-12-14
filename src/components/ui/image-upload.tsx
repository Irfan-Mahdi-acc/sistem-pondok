'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadImage } from '@/actions/upload-actions'
import { Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
  label?: string
}

export function ImageUpload({ value, onChange, onRemove, label = "Gambar (Opsional)" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    console.log('ImageUpload: Starting upload for file:', {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      console.log('ImageUpload: Calling uploadImage action...')
      const res = await uploadImage(formData)
      console.log('ImageUpload: Upload response:', res)
      
      if (res.success && res.url) {
        console.log('ImageUpload: Upload successful, URL:', res.url)
        onChange(res.url)
      } else {
        const errorMessage = res.error || 'Unknown error'
        console.error('ImageUpload: Upload failed:', errorMessage)
        alert(`Gagal mengupload gambar: ${errorMessage}`)
      }
    } catch (error) {
      console.error('ImageUpload: Exception during upload:', error)
      alert('Terjadi kesalahan saat mengupload gambar. Silakan coba lagi.')
    } finally {
      setIsUploading(false)
      // Reset input to allow re-uploading the same file
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {value ? (
        <div className="relative w-full max-w-md aspect-video rounded-lg border overflow-hidden bg-muted">
          <Image 
            src={value} 
            alt="Preview" 
            fill 
            className="object-contain"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading}
            className="cursor-pointer"
          />
          {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
      )}
    </div>
  )
}
