import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getViolationRecords, getViolationCategories } from "@/actions/violation-actions"
import { getSantriList } from "@/actions/santri-actions"
import { getPiketAreas } from "@/actions/piket-actions"
import { getAsramaList } from "@/actions/asrama-actions"
import { getKelasList } from "@/actions/kelas-actions"
import { getDailySchedules } from "@/actions/daily-schedule-actions"
import { ViolationList } from "@/components/aktivitas/violation-list"
import { AddViolationDialog } from "@/components/aktivitas/add-violation-dialog"
import { PiketManager } from "@/components/aktivitas/piket-manager"
import { DailyScheduleManager } from "@/components/aktivitas/daily-schedule-manager"
import { AddDailyScheduleDialog } from "@/components/aktivitas/add-daily-schedule-dialog"

export default async function AktivitasPage() {
  const [violationRecords, violationCategories, santriList, asramaList, kelasList, piketAreas, dailySchedules] = await Promise.all([
    getViolationRecords(),
    getViolationCategories(),
    getSantriList(),
    getAsramaList(),
    getKelasList(),
    getPiketAreas(),
    getDailySchedules()
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Aktivitas Harian Santri</h1>
      </div>

      <Tabs defaultValue="jadwal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jadwal">Jadwal Harian</TabsTrigger>
          <TabsTrigger value="ibadah">Jurnal Ibadah</TabsTrigger>
          <TabsTrigger value="piket">Jadwal Piket</TabsTrigger>
          <TabsTrigger value="pelanggaran">Pelanggaran</TabsTrigger>
          <TabsTrigger value="prestasi">Prestasi</TabsTrigger>
        </TabsList>

        <TabsContent value="jadwal" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Jadwal Harian Pondok</CardTitle>
                <AddDailyScheduleDialog />
              </div>
            </CardHeader>
            <CardContent>
              <DailyScheduleManager schedules={dailySchedules} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ibadah" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Jurnal Ibadah Harian</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Fitur pencatatan sholat berjamaah, tilawah, dan puasa sunnah.</p>
                <p className="text-sm mt-2">(Akan segera hadir)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="piket" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Jadwal Piket Asrama, Kelas & Area Umum</CardTitle>
            </CardHeader>
            <CardContent>
              <PiketManager 
                asramaList={asramaList} 
                kelasList={kelasList} 
                santriList={santriList}
                piketAreas={piketAreas}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pelanggaran" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Data Pelanggaran</h2>
            <AddViolationDialog santriList={santriList} categories={violationCategories} />
          </div>
          <Card>
            <CardContent className="pt-6">
              <ViolationList initialRecords={violationRecords} categories={violationCategories} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prestasi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Catatan Prestasi Santri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Rekam jejak prestasi akademik dan non-akademik.</p>
                <p className="text-sm mt-2">(Akan segera hadir)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
