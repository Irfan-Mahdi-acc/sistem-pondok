import { getNilaiInputData } from "@/actions/nilai-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Calendar, BookOpen } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { NilaiInputTable } from "@/components/nilai/nilai-input-table"

export default async function NilaiInputPage({
  params
}: {
  params: Promise<{ lembagaId: string; examId: string }>
}) {
  const { lembagaId, examId } = await params

  try {
    const data = await getNilaiInputData(examId)

    const getExamTypeBadge = (type: string) => {
      const variants: Record<string, { label: string; className: string }> = {
        HARIAN: { label: "Harian", className: "bg-blue-500" },
        UTS: { label: "UTS", className: "bg-purple-500" },
        UAS: { label: "UAS", className: "bg-red-500" },
        LISAN: { label: "Lisan", className: "bg-green-500" },
        PRAKTEK: { label: "Praktek", className: "bg-orange-500" },
        HAFALAN: { label: "Hafalan", className: "bg-teal-500" },
      }

      const variant = variants[type] || { label: type, className: "bg-gray-500" }
      return <Badge className={variant.className}>{variant.label}</Badge>
    }

    const nilaiCount = data.santriList.filter((s: any) => s.score !== null).length
    const totalSantri = data.santriList.length

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/academic/exams/${lembagaId}?mapelId=${data.ujian.mapelId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Kembali
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Input Nilai Ujian</h1>
              <p className="text-sm text-muted-foreground">
                Input nilai untuk semua santri
              </p>
            </div>
          </div>
        </div>

        {/* Exam Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {data.ujian.name}
                </CardTitle>
                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(data.ujian.date), 'dd MMMM yyyy', { locale: idLocale })}
                  </div>
                  {getExamTypeBadge(data.ujian.type)}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Status Nilai</p>
                <p className="text-2xl font-bold">
                  {nilaiCount}/{totalSantri}
                </p>
                <Badge 
                  variant={nilaiCount === totalSantri ? "default" : nilaiCount > 0 ? "secondary" : "outline"}
                >
                  {nilaiCount === totalSantri ? "Lengkap" : nilaiCount > 0 ? "Sebagian" : "Belum Ada"}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Nilai Input Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Santri & Nilai</CardTitle>
          </CardHeader>
          <CardContent>
            <NilaiInputTable 
              ujianId={data.ujian.id}
              mapelId={data.ujian.mapelId}
              santriList={data.santriList}
            />
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("Error loading nilai input page:", error)
    notFound()
  }
}
