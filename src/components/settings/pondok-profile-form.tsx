'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { LogoUpload } from "@/components/ui/logo-upload"
import { updatePondokProfile } from "@/actions/pondok-profile-actions"
import { useRouter } from 'next/navigation'

interface PondokProfileFormProps {
  pondokProfile: {
    name: string
    address: string | null
    phone: string | null
    email: string | null
    website: string | null
    logoUrl: string | null
    description: string | null
  }
}

export function PondokProfileForm({ pondokProfile }: PondokProfileFormProps) {
  const router = useRouter()
  const [logoUrl, setLogoUrl] = useState(pondokProfile.logoUrl || '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData(e.currentTarget)
    formData.set('logoUrl', logoUrl)

    await updatePondokProfile(formData)
    
    setSaving(false)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Pondok Pesantren</CardTitle>
        <CardDescription>
          Kelola informasi umum pondok pesantren
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Pondok *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={pondokProfile.name}
                required
                placeholder="contoh: Pondok Pesantren Tadzimussunnah"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={pondokProfile.phone || ''}
                placeholder="contoh: 0812-3456-7890"
                type="tel"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Alamat Lengkap</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={pondokProfile.address || ''}
              placeholder="Alamat lengkap pondok pesantren"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                defaultValue={pondokProfile.email || ''}
                placeholder="contoh: info@pondok.com"
                type="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                defaultValue={pondokProfile.website || ''}
                placeholder="contoh: https://pondok.com"
                type="url"
              />
            </div>
          </div>

          <LogoUpload
            currentLogoUrl={logoUrl}
            onLogoChange={setLogoUrl}
            label="Logo Pondok"
            id="pondokLogo"
          />

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi / Visi Misi</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={pondokProfile.description || ''}
              placeholder="Deskripsi singkat, visi, atau misi pondok pesantren"
              rows={4}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
