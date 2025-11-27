import { getLembagas } from "@/actions/lembaga-actions"
import { getAcademicYears } from "@/actions/academic-year-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GlobalStartSemesterButton } from "@/components/nilai-raport/global-start-semester-button"
import Link from "next/link"
import { FileText } from "lucide-react"

export default async function NilaiRaportPage() {
  const [lembagaList, academicYears] = await Promise.all([
    getLembagas(),
    getAcademicYears()
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nilai & Raport</h1>
          <p className="text-sm text-muted-foreground">
            Kelola nilai ujian dan raport santri
          </p>
        </div>
        {academicYears.length > 0 && lembagaList.length > 0 && (
          <GlobalStartSemesterButton 
            lembagaList={lembagaList}
            academicYears={academicYears}
          />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pilih Lembaga</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Pilih lembaga untuk mengelola nilai dan raport
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lembagaList.map((lembaga) => (
              <Link key={lembaga.id} href={`/dashboard/academic/nilai-raport/${lembaga.id}`}>
                <Card className="hover:bg-accent cursor-pointer transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{lembaga.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {lembaga.jenjang || 'Tidak ada jenjang'}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
