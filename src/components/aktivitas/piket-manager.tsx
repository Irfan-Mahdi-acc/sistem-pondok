'use client'

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { getPiketSchedules, createPiketSchedule, deletePiketSchedule } from "@/actions/piket-actions"
import { useToast } from "@/components/ui/toast"
import { AddPiketDialog } from "./add-piket-dialog"

import { ManageAreaDialog } from "./manage-area-dialog"
import { QuickAddPiketDialog } from "./quick-add-piket-dialog"

type PiketManagerProps = {
  asramaList: any[]
  kelasList: any[]
  santriList: any[]
  piketAreas: any[]
}

const DAYS = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "AHAD"]

export function PiketManager({ asramaList, kelasList, santriList, piketAreas }: PiketManagerProps) {
  const [activeTab, setActiveTab] = useState("asrama")
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  // Reset selection when tab changes
  useEffect(() => {
    setSelectedLocation("")
    setSchedules([])
  }, [activeTab])

  // Fetch schedules when location changes
  useEffect(() => {
    if (!selectedLocation) return
    
    const fetchSchedules = async () => {
      setLoading(true)
      const type = activeTab === "asrama" ? "ASRAMA" : activeTab === "kelas" ? "KELAS" : "AREA"
      const data = await getPiketSchedules(type as any, selectedLocation)
      setSchedules(data)
      setLoading(false)
    }

    fetchSchedules()
  }, [selectedLocation, activeTab])

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus petugas piket ini?")) return
    
    const result = await deletePiketSchedule(id)
    if (result.success) {
      setSchedules(schedules.filter(s => s.id !== id))
      toast.showToast("Petugas berhasil dihapus", "success")
    } else {
      toast.showToast("Gagal menghapus petugas", "error")
    }
  }

  const handleAddSuccess = (newSchedule: any) => {
    const fetchSchedules = async () => {
        const type = activeTab === "asrama" ? "ASRAMA" : activeTab === "kelas" ? "KELAS" : "AREA"
        const data = await getPiketSchedules(type as any, selectedLocation)
        setSchedules(data)
    }
    fetchSchedules()
  }

  const handleUpdateAreas = () => {
    window.location.reload() // Simple reload to refresh area list
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="asrama">Piket Asrama</TabsTrigger>
          <TabsTrigger value="kelas">Piket Kelas</TabsTrigger>
          <TabsTrigger value="area">Piket Area / Umum</TabsTrigger>
        </TabsList>

        <div className="my-4 flex items-center gap-4">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder={
                activeTab === "asrama" ? "Pilih Asrama" : 
                activeTab === "kelas" ? "Pilih Kelas" : "Pilih Area"
              } />
            </SelectTrigger>
            <SelectContent>
              {activeTab === "asrama" ? (
                asramaList.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)
              ) : activeTab === "kelas" ? (
                kelasList.map(k => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)
              ) : (
                piketAreas.map(a => <SelectItem key={a.id} value={a.id}>{a.name} ({a.frequency})</SelectItem>)
              )}
            </SelectContent>
          </Select>

          {activeTab === "area" && (
            <ManageAreaDialog areas={piketAreas} onUpdate={handleUpdateAreas} />
          )}

          {selectedLocation && (
            <div className="flex gap-2">
              <AddPiketDialog 
                type={activeTab === "asrama" ? "ASRAMA" : activeTab === "kelas" ? "KELAS" : "AREA"}
                locationId={selectedLocation}
                santriList={santriList}
                onSuccess={handleAddSuccess}
              />
              <QuickAddPiketDialog 
                type={activeTab === "asrama" ? "ASRAMA" : activeTab === "kelas" ? "KELAS" : "AREA"}
                locationId={selectedLocation}
                santriList={santriList}
                onSuccess={() => handleAddSuccess(null as any)}
              />
            </div>
          )}
        </div>

        <TabsContent value="asrama" className="space-y-4">
           <ScheduleGrid 
             schedules={schedules} 
             loading={loading} 
             onDelete={handleDelete} 
             selectedLocation={selectedLocation}
           />
        </TabsContent>

        <TabsContent value="kelas" className="space-y-4">
           <ScheduleGrid 
             schedules={schedules} 
             loading={loading} 
             onDelete={handleDelete}
             selectedLocation={selectedLocation}
           />
        </TabsContent>

        <TabsContent value="area" className="space-y-4">
           <ScheduleGrid 
             schedules={schedules} 
             loading={loading} 
             onDelete={handleDelete}
             selectedLocation={selectedLocation}
           />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ScheduleGrid({ schedules, loading, onDelete, selectedLocation }: any) {
  if (!selectedLocation) {
    return <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">Silakan pilih lokasi terlebih dahulu</div>
  }

  if (loading) {
    return <div className="text-center py-12">Memuat jadwal...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {DAYS.map(day => {
        const daySchedules = schedules.filter((s: any) => s.day === day)
        return (
          <Card key={day} className="h-full">
            <CardHeader className="pb-2 bg-muted/50">
              <CardTitle className="text-center text-lg">{day}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {daySchedules.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center italic">Belum ada petugas</p>
              ) : (
                daySchedules.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between group p-2 rounded-md hover:bg-muted/50 border border-transparent hover:border-border transition-colors">
                    <div className="overflow-hidden">
                      <p className="font-medium text-sm truncate">{s.santri.nama}</p>
                      {s.area && <p className="text-xs text-muted-foreground truncate">{s.area}</p>}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                      onClick={() => onDelete(s.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
