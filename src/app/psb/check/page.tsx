'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getPSBRegistrationByNo } from "@/actions/psb-actions"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react"

export default function CheckStatusPage() {
  const [regNo, setRegNo] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regNo) return

    setLoading(true)
    try {
      const data = await getPSBRegistrationByNo(regNo)
      if (data) {
        setResult(data)
      } else {
        setResult(null)
        toast.error("Data pendaftaran tidak ditemukan")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: any; message: string }> = {
      'PENDING': {
        label: 'Menunggu Verifikasi',
        color: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
        icon: Clock,
        message: 'Pendaftaran Anda sedang diverifikasi oleh admin.'
      },
      'PAYMENT_VERIFIED': {
        label: 'Pembayaran Terverifikasi',
        color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        icon: CheckCircle2,
        message: 'Pembayaran pendaftaran Anda sudah terverifikasi. Menunggu jadwal wawancara.'
      },
      'INTERVIEW': {
        label: 'Tahap Wawancara',
        color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
        icon: AlertCircle,
        message: 'Anda akan dihubungi melalui WhatsApp untuk jadwal wawancara.'
      },
      'ACCEPTED': {
        label: 'DITERIMA',
        color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
        icon: CheckCircle2,
        message: 'Selamat! Anda dinyatakan DITERIMA. Menunggu penempatan lembaga dan kelas.'
      },
      'ASSIGNED': {
        label: 'Sudah Ditempatkan',
        color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
        icon: CheckCircle2,
        message: 'Anda sudah ditempatkan di lembaga dan kelas. Silakan lakukan daftar ulang.'
      },
      'CONFIRMED': {
        label: 'TERKONFIRMASI',
        color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
        icon: CheckCircle2,
        message: 'Selamat! Anda sudah terdaftar sebagai santri.'
      },
      'REJECTED': {
        label: 'Tidak Diterima',
        color: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
        icon: XCircle,
        message: 'Mohon maaf, Anda belum dapat diterima pada gelombang ini.'
      },
      'DECLINED': {
        label: 'Menolak Penempatan',
        color: 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
        icon: XCircle,
        message: 'Anda menolak penempatan yang diberikan.'
      },
    }
    return statusMap[status] || statusMap['PENDING']
  }

  const statusInfo = result ? getStatusInfo(result.status) : null
  const StatusIcon = statusInfo?.icon

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8 px-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Cek Status Pendaftaran</h1>
        <p className="text-muted-foreground">Masukkan Nomor Pendaftaran Anda untuk melihat status terkini.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleCheck} className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Contoh: PSB-2024-0001" 
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Mencari..." : "Cek"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result && statusInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Hasil Pencarian</CardTitle>
            <CardDescription>Data ditemukan untuk nomor pendaftaran {result.registrationNo}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-muted-foreground">Nama</div>
                <div className="font-semibold">{result.name}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Gelombang</div>
                <div className="font-semibold">{result.period?.name}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Lembaga Tujuan</div>
                <div className="font-semibold">{result.period?.lembaga?.name}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Kontak</div>
                <div className="font-semibold">{result.phone}</div>
              </div>
            </div>

            {/* Status */}
            <div className={`p-4 rounded-md flex items-start gap-3 ${statusInfo.color}`}>
              {StatusIcon && <StatusIcon className="h-5 w-5 mt-0.5" />}
              <div>
                <div className="font-semibold mb-1">{statusInfo.label}</div>
                <div className="text-sm">{statusInfo.message}</div>
              </div>
            </div>

            {/* Assignment Info */}
            {result.assignedLembagaId && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Penempatan</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-muted-foreground">Lembaga</div>
                    <div className="font-semibold">{result.assignedLembaga?.name}</div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Kelas</div>
                    <div className="font-semibold">{result.assignedKelas?.name}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Re-registration Fee */}
            {result.status === 'ASSIGNED' && result.reregistrationFeeDetails && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Biaya Daftar Ulang</h4>
                <div className="space-y-2">
                  {Object.entries(result.reregistrationFeeDetails as Record<string, number>).map(([name, amount]) => (
                    <div key={name} className="flex justify-between text-sm">
                      <span>{name}</span>
                      <span className="font-medium">Rp {amount.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-semibold text-base border-t pt-2">
                    <span>Total</span>
                    <span>Rp {Object.values(result.reregistrationFeeDetails as Record<string, number>).reduce((a, b) => a + b, 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Silakan hubungi admin untuk informasi pembayaran daftar ulang.
                </div>
              </div>
            )}

            {/* Confirmed Message */}
            {result.status === 'CONFIRMED' && (
              <div className="border-t pt-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                  <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                    Selamat Datang di {result.assignedLembaga?.name}!
                  </h4>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Anda sudah terdaftar sebagai santri di kelas {result.assignedKelas?.name}. 
                    Silakan hubungi admin untuk informasi lebih lanjut mengenai orientasi dan jadwal masuk.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
