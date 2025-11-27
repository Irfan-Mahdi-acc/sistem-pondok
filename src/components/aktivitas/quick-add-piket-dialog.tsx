'use client'

import { useState } from "react"
import { UserPlus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { createPiketSchedule } from "@/actions/piket-actions"
import { useToast } from "@/components/ui/toast"
import { ScrollArea } from "@/components/ui/scroll-area"

const DAYS = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "AHAD"]

type QuickAddPiketDialogProps = {
  type: "ASRAMA" | "KELAS" | "AREA"
  locationId: string
  santriList: any[]
  onSuccess: () => void
}

export function QuickAddPiketDialog({ type, locationId, santriList, onSuccess }: QuickAddPiketDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState("")
  const [selectedSantri, setSelectedSantri] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  const filteredSantri = santriList.filter(s => 
    s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nis.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleSantri = (santriId: string) => {
    const newSet = new Set(selectedSantri)
    if (newSet.has(santriId)) {
      newSet.delete(santriId)
    } else {
      newSet.add(santriId)
    }
    setSelectedSantri(newSet)
  }

  const toggleAll = () => {
    if (selectedSantri.size === filteredSantri.length) {
      setSelectedSantri(new Set())
    } else {
      setSelectedSantri(new Set(filteredSantri.map(s => s.id)))
    }
  }

  const handleSubmit = async () => {
    if (!selectedDay) {
      toast.showToast("Pilih hari terlebih dahulu", "error")
      return
    }
    if (selectedSantri.size === 0) {
      toast.showToast("Pilih minimal 1 santri", "error")
      return
    }

    setIsSubmitting(true)
    let successCount = 0
    let failCount = 0

    for (const santriId of selectedSantri) {
      const result = await createPiketSchedule({
        type,
        locationId,
        day: selectedDay,
        santriId,
      })
      if (result.success) {
        successCount++
      } else {
        failCount++
      }
    }

    setIsSubmitting(false)
    
    if (failCount === 0) {
      toast.showToast(`Berhasil menambahkan ${successCount} petugas`, "success")
      setOpen(false)
      setSelectedSantri(new Set())
      setSelectedDay("")
      setSearchQuery("")
      onSuccess()
    } else {
      toast.showToast(`${successCount} berhasil, ${failCount} gagal`, "error")
      onSuccess()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="mr-2 h-4 w-4" />
          Quick Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Quick Add Petugas Piket</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Day Selector */}
          <div>
            <Label>Pilih Hari</Label>
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Hari" />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau NIS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Select All */}
          <div className="flex items-center space-x-2 border-b pb-2">
            <Checkbox
              id="select-all"
              checked={selectedSantri.size === filteredSantri.length && filteredSantri.length > 0}
              onCheckedChange={toggleAll}
            />
            <Label htmlFor="select-all" className="font-medium cursor-pointer">
              Pilih Semua ({selectedSantri.size} dari {filteredSantri.length})
            </Label>
          </div>

          {/* Santri List */}
          <ScrollArea className="h-[300px] border rounded-md p-4">
            <div className="space-y-3">
              {filteredSantri.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Tidak ada santri ditemukan
                </p>
              ) : (
                filteredSantri.map((santri) => (
                  <div key={santri.id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md">
                    <Checkbox
                      id={santri.id}
                      checked={selectedSantri.has(santri.id)}
                      onCheckedChange={() => toggleSantri(santri.id)}
                    />
                    <Label htmlFor={santri.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">{santri.nama}</div>
                      <div className="text-sm text-muted-foreground">{santri.nis}</div>
                    </Label>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Submit */}
          <Button 
            onClick={handleSubmit} 
            className="w-full" 
            disabled={isSubmitting || selectedSantri.size === 0 || !selectedDay}
          >
            {isSubmitting ? "Menambahkan..." : `Tambahkan ${selectedSantri.size} Petugas`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
