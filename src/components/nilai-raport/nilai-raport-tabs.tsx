"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, BookMarked } from "lucide-react"
import { NilaiMapelTab } from "./nilai-mapel-tab"
import { NilaiNonMapelTab } from "./nilai-non-mapel-tab"
import { NilaiHifdzTab } from "./nilai-hifdz-tab"

interface NilaiRaportTabsProps {
  lembagaId: string
  academicYearId?: string
  semester?: string
}

export function NilaiRaportTabs({ lembagaId, academicYearId, semester }: NilaiRaportTabsProps) {
  if (!academicYearId || !semester) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Pilih tahun akademik dan semester terlebih dahulu</p>
      </div>
    )
  }

  return (
    <Tabs defaultValue="mapel" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="mapel">
          <BookOpen className="h-4 w-4 mr-2" />
          Nilai Mapel
        </TabsTrigger>
        <TabsTrigger value="non-mapel">
          <Users className="h-4 w-4 mr-2" />
          Nilai Non-Mapel
        </TabsTrigger>
        <TabsTrigger value="hifdz">
          <BookMarked className="h-4 w-4 mr-2" />
          Nilai Hifdz
        </TabsTrigger>
      </TabsList>

      <TabsContent value="mapel">
        <NilaiMapelTab 
          lembagaId={lembagaId}
          academicYearId={academicYearId}
          semester={semester}
        />
      </TabsContent>

      <TabsContent value="non-mapel">
        <NilaiNonMapelTab 
          lembagaId={lembagaId}
          academicYearId={academicYearId}
          semester={semester}
        />
      </TabsContent>

      <TabsContent value="hifdz">
        <NilaiHifdzTab 
          lembagaId={lembagaId}
          academicYearId={academicYearId}
          semester={semester}
        />
      </TabsContent>
    </Tabs>
  )
}
