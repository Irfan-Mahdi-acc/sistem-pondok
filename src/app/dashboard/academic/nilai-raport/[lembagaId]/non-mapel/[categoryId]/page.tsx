import { getLembagaCategoryById } from "@/actions/lembaga-category-actions"
import { getSantriList } from "@/actions/santri-actions"
import { getNilaiByCategory } from "@/actions/nilai-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { NonMapelNilaiInputForm } from "@/components/nilai-raport/non-mapel-nilai-input-form"

export default async function InputNilaiNonMapelPage({
  params,
  searchParams
}: {
  params: Promise<{ lembagaId: string; categoryId: string }>
  searchParams: Promise<{ academicYearId?: string; semester?: string }>
}) {
  const { lembagaId, categoryId } = await params
  const { academicYearId, semester } = await searchParams

  if (!academicYearId || !semester) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            Pilih tahun akademik dan semester terlebih dahulu
          </p>
        </Card>
      </div>
    )
  }

  const [category, santriList, existingNilai] = await Promise.all([
    getLembagaCategoryById(categoryId),
    getSantriList(),
    getNilaiByCategory(categoryId, academicYearId, semester)
  ])

  if (!category) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Kategori tidak ditemukan</p>
        </Card>
      </div>
    )
  }

  // Filter santri by lembaga
  const filteredSantri = santriList.filter(s => s.lembagaId === lembagaId && s.status === 'ACTIVE')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/dashboard/academic/nilai-raport/${lembagaId}?academicYearId=${academicYearId}&semester=${semester}`}>
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Input Nilai - {category.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            {category.groupName && (
              <Badge variant="outline">Grup: {category.groupName}</Badge>
            )}
            <Badge variant="secondary">
              {category.gradeType === 'NUMERIC' ? 'Angka' : 'Huruf'}
            </Badge>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Santri</CardTitle>
        </CardHeader>
        <CardContent>
          <NonMapelNilaiInputForm
            categoryId={categoryId}
            santriList={filteredSantri}
            existingNilai={existingNilai}
            academicYearId={academicYearId}
            semester={semester}
            gradeType={category.gradeType}
          />
        </CardContent>
      </Card>
    </div>
  )
}
