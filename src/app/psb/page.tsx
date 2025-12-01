import { getPSBPeriods } from "@/actions/psb-actions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle, FileText } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

export default async function PSBLandingPage() {
  // Get ALL active periods (not just one)
  const allPeriods = await getPSBPeriods()
  const activePeriods = allPeriods.filter(p => p.isActive)

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-gray-900 dark:text-white">
          Penerimaan Santri Baru
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Bergabunglah bersama kami di Pondok Pesantren Tadzimussunnah. Membentuk generasi Rabbani yang berilmu dan beramal.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          {activePeriods.length > 0 ? (
            <Link href="/psb/register">
              <Button size="lg" className="text-lg px-8">Daftar Sekarang</Button>
            </Link>
          ) : (
            <Button size="lg" disabled>Pendaftaran Ditutup</Button>
          )}
          <Link href="/psb/check">
            <Button variant="outline" size="lg">Cek Status Pendaftaran</Button>
          </Link>
        </div>
      </section>

      {/* Active Periods - Show ALL */}
      {activePeriods.length > 0 && (
        <section className="max-w-5xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Gelombang Pendaftaran Aktif</h2>
            <p className="text-muted-foreground mt-2">Pilih lembaga sesuai minat Anda</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {activePeriods.map((period) => (
              <Card key={period.id} className="border-primary/20 bg-primary/5 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{period.name}</CardTitle>
                      <CardDescription className="mt-1">
                        <Badge variant="default" className="mt-2">{period.lembaga?.name}</Badge>
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20">
                      Aktif
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Period Dates */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(period.startDate), "d MMM", { locale: id })} - {format(new Date(period.endDate), "d MMM yyyy", { locale: id })}
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-background rounded-lg">
                      <div className="text-xs text-muted-foreground">Kuota</div>
                      <div className="text-lg font-bold">{period.quota || "∞"}</div>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg">
                      <div className="text-xs text-muted-foreground">Pendaftar</div>
                      <div className="text-lg font-bold">{period._count?.registrations || 0}</div>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg">
                      <div className="text-xs text-muted-foreground">Sisa Hari</div>
                      <div className="text-lg font-bold">
                        {Math.max(0, Math.ceil((new Date(period.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                      </div>
                    </div>
                  </div>

                  {/* Fee Breakdown */}
                  {period.registrationFeeDetails && Object.keys(period.registrationFeeDetails as any).length > 0 && (
                    <div className="border-t pt-3">
                      <div className="text-sm font-semibold mb-2">Biaya Pendaftaran:</div>
                      <div className="space-y-1 text-sm">
                        {Object.entries(period.registrationFeeDetails as Record<string, number>).map(([name, amount]) => (
                          <div key={name} className="flex justify-between">
                            <span className="text-muted-foreground">{name}</span>
                            <span className="font-medium">Rp {amount.toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-bold border-t pt-1">
                          <span>Total</span>
                          <span>Rp {period.registrationFee.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Register Button */}
                  <Link href={`/psb/register?periodId=${period.id}`} className="block">
                    <Button className="w-full">Daftar ke {period.lembaga?.name}</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* No Active Periods Message */}
      {activePeriods.length === 0 && (
        <section className="max-w-2xl mx-auto text-center py-12">
          <Card>
            <CardContent className="pt-6">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Belum Ada Gelombang Aktif</h3>
              <p className="text-muted-foreground">
                Saat ini belum ada gelombang pendaftaran yang dibuka. Silakan cek kembali nanti atau hubungi admin untuk informasi lebih lanjut.
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Features/Steps */}
      <section className="grid gap-8 md:grid-cols-3">
        <Card>
          <CardHeader>
            <FileText className="h-10 w-10 text-primary mb-2" />
            <CardTitle>1. Isi Formulir</CardTitle>
            <CardDescription>Lengkapi data diri, orang tua, dan asal sekolah melalui formulir online.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CheckCircle className="h-10 w-10 text-primary mb-2" />
            <CardTitle>2. Seleksi & Interview</CardTitle>
            <CardDescription>Ikuti proses seleksi dan wawancara sesuai jadwal yang ditentukan.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Calendar className="h-10 w-10 text-primary mb-2" />
            <CardTitle>3. Pengumuman</CardTitle>
            <CardDescription>Cek status kelulusan secara berkala melalui halaman Cek Status.</CardDescription>
          </CardHeader>
        </Card>
      </section>
    </div>
  )
}
