import { getActivePSBPeriod } from "@/actions/psb-actions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle, FileText } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

export default async function PSBLandingPage() {
  const activePeriod = await getActivePSBPeriod()

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
          {activePeriod ? (
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

      {/* Active Period Info */}
      {activePeriod && (
        <section className="max-w-3xl mx-auto">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Gelombang Aktif: {activePeriod.name}</CardTitle>
              <CardDescription>
                Pendaftaran dibuka dari {format(new Date(activePeriod.startDate), "d MMMM yyyy", { locale: id })} sampai {format(new Date(activePeriod.endDate), "d MMMM yyyy", { locale: id })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3 text-center">
                <div className="p-4 bg-background rounded-lg shadow-sm">
                  <div className="font-semibold text-lg">Kuota</div>
                  <div className="text-2xl font-bold text-primary">{activePeriod.quota || "Tidak terbatas"}</div>
                </div>
                <div className="p-4 bg-background rounded-lg shadow-sm">
                  <div className="font-semibold text-lg">Biaya</div>
                  <div className="text-2xl font-bold text-primary">
                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(activePeriod.registrationFee)}
                  </div>
                </div>
                <div className="p-4 bg-background rounded-lg shadow-sm">
                  <div className="font-semibold text-lg">Sisa Waktu</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {Math.max(0, Math.ceil((new Date(activePeriod.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} Hari lagi
                  </div>
                </div>
              </div>
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
