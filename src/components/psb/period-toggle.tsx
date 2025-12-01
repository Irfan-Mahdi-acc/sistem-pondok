'use client'

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { updatePSBPeriod } from "@/actions/psb-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface PeriodToggleProps {
  periodId: string
  isActive: boolean
  periodName: string
}

export function PeriodToggle({ periodId, isActive, periodName }: PeriodToggleProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async (checked: boolean) => {
    setLoading(true)
    try {
      const result = await updatePSBPeriod(periodId, { isActive: checked })
      if (result.success) {
        toast.success(`Gelombang ${periodName} ${checked ? 'diaktifkan' : 'dinonaktifkan'}`)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error("Gagal mengubah status gelombang")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isActive}
        onCheckedChange={handleToggle}
        disabled={loading}
      />
      <span className="text-xs text-muted-foreground">
        {isActive ? "Aktif" : "Non-aktif"}
      </span>
    </div>
  )
}
