'use client'

import { useState } from 'react'
import { uploadImage } from '@/actions/upload-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

interface LogoUploadProps {
  currentLogoUrl?: string | null
  onLogoChange: (url: string) => void
  label: string
  id: string
}

export function LogoUpload({ currentLogoUrl, onLogoChange, label, id }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentLogoUrl || null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadImage(formData)

    if (result.success && result.url) {
      onLogoChange(result.url)
      setError(null)
    } else {
      setError(result.error || 'Upload failed')
      setPreview(currentLogoUrl || null)
    }

    setUploading(false)
  }

  const handleRemove = () => {
    setPreview(null)
    onLogoChange('')
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      
      {preview ? (
        <div className="space-y-3">
          <div className="relative w-40 h-40 border-2 rounded-lg overflow-hidden bg-white p-4 shadow-md">
            <Image
              src={preview}
              alt="Logo preview"
              fill
              className="object-contain p-2"
            />
          </div>
          <div className="flex gap-2">
            <Input
              id={id}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById(id)?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Ganti Logo'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            id={id}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById(id)?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Logo'}
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <p className="text-sm text-muted-foreground">
        Max 5MB. Format: JPG, PNG, GIF
      </p>
    </div>
  )
}
