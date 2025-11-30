'use client'

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function DateRangeFilter({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [date, setDate] = useState<DateRange | undefined>()
  const [preset, setPreset] = useState<string>("")

  // Initialize from URL params
  useEffect(() => {
    const start = searchParams.get("startDate")
    const end = searchParams.get("endDate")
    
    if (start && end) {
      setDate({
        from: new Date(start),
        to: new Date(end)
      })
    } else {
      // Default to current month
      // setDate({
      //   from: startOfMonth(new Date()),
      //   to: endOfMonth(new Date())
      // })
    }
  }, [searchParams])

  const updateFilters = (range: DateRange | undefined) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (range?.from) {
      params.set("startDate", range.from.toISOString())
    } else {
      params.delete("startDate")
    }

    if (range?.to) {
      params.set("endDate", range.to.toISOString())
    } else {
      params.delete("endDate")
    }

    // Remove legacy params if they exist
    params.delete("month")
    params.delete("year")

    router.push(`?${params.toString()}`)
  }

  const handlePresetChange = (value: string) => {
    setPreset(value)
    const now = new Date()
    let range: DateRange | undefined

    switch (value) {
      case "this_month":
        range = { from: startOfMonth(now), to: endOfMonth(now) }
        break
      case "last_month":
        const lastMonth = subMonths(now, 1)
        range = { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }
        break
      case "last_3_months":
        range = { from: subMonths(now, 3), to: now }
        break
      case "this_year":
        range = { from: startOfYear(now), to: endOfYear(now) }
        break
      case "all":
        range = undefined
        break
    }

    setDate(range)
    updateFilters(range)
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Pilih Periode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="this_month">Bulan Ini</SelectItem>
          <SelectItem value="last_month">Bulan Lalu</SelectItem>
          <SelectItem value="last_3_months">3 Bulan Terakhir</SelectItem>
          <SelectItem value="this_year">Tahun Ini</SelectItem>
          <SelectItem value="all">Semua Waktu</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd MMM y", { locale: idLocale })} -{" "}
                  {format(date.to, "dd MMM y", { locale: idLocale })}
                </>
              ) : (
                format(date.from, "dd MMM y", { locale: idLocale })
              )
            ) : (
              <span>Pilih Tanggal</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(range) => {
              setDate(range)
              if (range?.from && range?.to) {
                updateFilters(range)
                setPreset("custom")
              }
            }}
            numberOfMonths={2}
            locale={idLocale}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
