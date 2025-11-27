'use client'

import { useState } from 'react'
import { submitRegistration } from '@/actions/registration-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function RegistrationForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await submitRegistration(formData)
    
    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } else {
      alert(result.error)
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            <div>
              <h2 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
                Pendaftaran Berhasil!
              </h2>
              <p className="text-sm text-muted-foreground">
                Pendaftaran Anda telah dikirim dan menunggu persetujuan admin.
                <br />
                Anda akan dialihkan ke halaman login...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Pendaftaran</CardTitle>
        <CardDescription>
          Isi data diri Anda dengan lengkap
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          {/* Informasi Pribadi */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm border-b pb-2">Informasi Pribadi</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ahmad Yusuf"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">
                  Username <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="ahmadyusuf"
                  required
                  disabled={loading}
                  minLength={3}
                />
                <p className="text-xs text-muted-foreground">
                  Minimal 3 karakter, tanpa spasi
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">No. Telepon</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="08123456789"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Role yang Diminta */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm border-b pb-2">Role yang Diminta</h3>
            
            <div className="space-y-2">
              <Label htmlFor="requestedRole">
                Posisi/Role <span className="text-red-500">*</span>
              </Label>
              <Select name="requestedRole" required disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role yang diminta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USTADZ">Ustadz</SelectItem>
                  <SelectItem value="PENGURUS">Pengurus</SelectItem>
                  <SelectItem value="MUSYRIF">Musyrif</SelectItem>
                  <SelectItem value="ADMIN_KANTOR">Admin Kantor</SelectItem>
                  <SelectItem value="BENDAHARA">Bendahara</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Pilih role sesuai posisi yang Anda lamar
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Alasan Pendaftaran</Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="Jelaskan alasan Anda mendaftar dan pengalaman yang relevan..."
                rows={4}
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/login')}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Mengirim...' : 'Kirim Pendaftaran'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

