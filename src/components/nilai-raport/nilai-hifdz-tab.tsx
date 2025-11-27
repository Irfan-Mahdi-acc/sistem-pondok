"use client"

import { useEffect, useState } from "react"
import { getUjianHifdzBySantri } from "@/actions/ujian-hifdz-actions"
import { getSantriList } from "@/actions/santri-actions"
import { getUstadzList } from "@/actions/ustadz-actions"
import { getHalqohList } from "@/actions/halqoh-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UjianHifdzBulkForm } from "@/components/academic/ujian-hifdz/ujian-hifdz-bulk-form"
import { UjianHifdzSantriTable } from "@/components/academic/ujian-hifdz/ujian-hifdz-santri-table"
import { UjianHifdzFilter } from "@/components/academic/ujian-hifdz/ujian-hifdz-filter"
import { BookMarked } from "lucide-react"

interface NilaiHifdzTabProps {
  lembagaId: string
  academicYearId: string
  semester: string
}

export function NilaiHifdzTab({ lembagaId, academicYearId, semester }: NilaiHifdzTabProps) {
  const [santriData, setSantriData] = useState<any[]>([])
  const [santriList, setSantriList] = useState<any[]>([])
  const [ustadzList, setUstadzList] = useState<any[]>([])
  const [halqohs, setHalqohs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [data, santris, ustadz, halqohList] = await Promise.all([
          getUjianHifdzBySantri({ lembagaId }),
          getSantriList(),
          getUstadzList(),
          getHalqohList()
        ])
        
        // Filter data by semester and academic year
        const filteredData = data.map((santri: any) => ({
          ...santri,
          exams: santri.exams?.filter((record: any) => 
            record.semester === semester && record.academicYearId === academicYearId
          ) || []
        }))
        
        setSantriData(filteredData)
        setSantriList(santris)
        setUstadzList(ustadz)
        setHalqohs(halqohList)
      } catch (error) {
        console.error("Error loading hifdz data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [lembagaId, academicYearId, semester])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-primary" />
              <CardTitle>Nilai Ujian Hifdz</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                Semester {semester}
              </div>
              <UjianHifdzBulkForm 
                santriList={santriList} 
                ustadzList={ustadzList}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Kelola ujian hafalan Al-Qur'an per semester
          </p>

          <div className="mb-4">
            <UjianHifdzFilter 
              lembagas={[]} 
              halqohs={halqohs} 
            />
          </div>

          <UjianHifdzSantriTable data={santriData} lembagaId={lembagaId} />
        </CardContent>
      </Card>
    </div>
  )
}
