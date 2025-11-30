'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getPSBRegistrationByNo } from "@/actions/psb-actions"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

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

  return (
    <div className="max-w-md mx-auto py-12 space-y-8">
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
                {loading ? "Cek" : "Cek"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Hasil Pencarian</CardTitle>
            <CardDescription>Data ditemukan untuk nomor pendaftaran tersebut.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Nama:</div>
              <div>{result.name}</div>
              <div className="font-medium">Gelombang:</div>
              <div>{result.period?.name}</div>
              <div className="font-medium">Status:</div>
              <div>
                <Badge variant={result.status === 'ACCEPTED' ? 'default' : 'secondary'}>
                  {result.status}
                </Badge>
              </div>
            </div>
            {result.status === 'ACCEPTED' && (
              <div className="bg-green-50 text-green-700 p-4 rounded-md text-sm mt-4 dark:bg-green-900/20 dark:text-green-400">
                Selamat! Anda dinyatakan DITERIMA. Silakan hubungi admin untuk informasi daftar ulang.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
