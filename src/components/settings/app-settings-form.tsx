'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { LogoUpload } from "@/components/ui/logo-upload"
import { updateAppSettings } from "@/actions/settings-actions"
import { useRouter } from 'next/navigation'

interface AppSettingsFormProps {
  appSettings: {
    appName: string
    logoUrl: string | null
  }
}

export function AppSettingsForm({ appSettings }: AppSettingsFormProps) {
  const router = useRouter()
  const [logoUrl, setLogoUrl] = useState(appSettings.logoUrl || '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData(e.currentTarget)
    formData.set('logoUrl', logoUrl)

    await updateAppSettings(formData)
    
    setSaving(false)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding Aplikasi</CardTitle>
        <CardDescription>
          Atur nama dan logo aplikasi yang akan ditampilkan di sidebar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appName">Nama Aplikasi *</Label>
            <Input
              id="appName"
              name="appName"
              defaultValue={appSettings.appName}
              required
              placeholder="contoh: Sistem Pondok Tadzimussunnah"
            />
            <p className="text-sm text-muted-foreground">
              Nama ini akan ditampilkan di pojok kiri atas aplikasi
            </p>
          </div>

          <LogoUpload
            currentLogoUrl={logoUrl}
            onLogoChange={setLogoUrl}
            label="Logo Aplikasi"
            id="appLogo"
          />

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
