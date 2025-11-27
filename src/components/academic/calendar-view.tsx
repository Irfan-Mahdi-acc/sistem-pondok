'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download } from "lucide-react"
import { useState } from "react"
import { useTheme } from "next-themes"

type CalendarEvent = {
  id: string
  title: string
  type: string
  startDate: Date
  endDate: Date
  academicYear: string
  color?: string
}

type AcademicYear = {
  id: string
  name: string
  startDate: Date
  endDate: Date
  isActive: boolean
}

type CalendarViewProps = {
  events: CalendarEvent[]
  academicYears: AcademicYear[]
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

// Get months between two dates
function getMonthsInRange(startDate: Date, endDate: Date) {
  const months: { month: number; year: number }[] = []
  const current = new Date(startDate)
  current.setDate(1) // Start from first day of month
  
  const end = new Date(endDate)
  
  while (current <= end) {
    months.push({
      month: current.getMonth(),
      year: current.getFullYear()
    })
    current.setMonth(current.getMonth() + 1)
  }
  
  return months
}

export function CalendarView({ events, academicYears }: CalendarViewProps) {
  const { theme, setTheme } = useTheme()
  const activeYears = academicYears.filter(y => y.isActive)
  const [selectedYearId, setSelectedYearId] = useState(activeYears[0]?.id || '')
  const [isExporting, setIsExporting] = useState(false)
  
  const selectedYear = academicYears.find(y => y.id === selectedYearId)
  
  if (!selectedYear) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Belum ada tahun akademik aktif. Silakan aktifkan tahun akademik terlebih dahulu.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Get months for selected academic year
  const monthsToDisplay = getMonthsInRange(
    new Date(selectedYear.startDate),
    new Date(selectedYear.endDate)
  )

  // Filter events by selected academic year
  const filteredEvents = events.filter(e => e.academicYear === selectedYear.name)
  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      
      // Use string comparison (YYYY-MM-DD) to avoid timezone/time issues
      // en-CA locale always returns YYYY-MM-DD format
      const dateStr = date.toLocaleDateString('en-CA')
      const startStr = eventStart.toLocaleDateString('en-CA')
      const endStr = eventEnd.toLocaleDateString('en-CA')
      
      return dateStr >= startStr && dateStr <= endStr
    })
  }

  // Get color for event
  const getEventColor = (event: CalendarEvent) => {
    if (event.color) {
      return {
        dot: event.color,
        border: event.color,
        bg: `${event.color}1A` // 10% opacity
      }
    }

    // Fallback colors based on type
    switch (event.type) {
      case 'HOLIDAY':
        return { dot: '#ef4444', border: '#fca5a5', bg: '#fef2f2' } // red-500, red-300, red-50
      case 'EXAM':
        return { dot: '#f97316', border: '#fdba74', bg: '#fff7ed' } // orange-500, orange-300, orange-50
      case 'EVENT':
        return { dot: '#3b82f6', border: '#93c5fd', bg: '#eff6ff' } // blue-500, blue-300, blue-50
      default:
        return { dot: '#6b7280', border: '#d1d5db', bg: '#f9fafb' } // gray-500, gray-300, gray-50
    }
  }

  // Generate calendar for a month
  const generateMonth = (monthIndex: number, year: number) => {
    const firstDay = new Date(year, monthIndex, 1)
    const lastDay = new Date(year, monthIndex + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const handleExportPDF = async () => {
    if (isExporting) return
    setIsExporting(true)
    const originalTheme = theme

    try {
      // 1. Switch to dark mode for cleaner DOM structure
      setTheme('dark')
      
      // 2. Wait for theme transition
      await new Promise(resolve => setTimeout(resolve, 800))

      const domtoimage = await import('dom-to-image-more')
      const jsPDF = (await import('jspdf')).default
      
      // Get all month cards
      const calendarGrid = document.getElementById('calendar-grid')
      if (!calendarGrid) throw new Error("Calendar grid not found")
      
      const monthCards = Array.from(calendarGrid.children) as HTMLElement[]
      const monthsPerPage = 2 // 2 months per page
      const totalPages = Math.ceil(monthCards.length / monthsPerPage)
      
      // Create PDF (A4 landscape)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })
      
      const pageWidth = 297
      const pageHeight = 210
      
      // Process each page
      for (let page = 0; page < totalPages; page++) {
        const startIdx = page * monthsPerPage
        const endIdx = Math.min(startIdx + monthsPerPage, monthCards.length)
        const pageMonths = monthCards.slice(startIdx, endIdx)
        
        // Add new page if not first
        if (page > 0) {
          pdf.addPage()
        }
        
        // Add professional header with logo and pondok name
        const { addPDFHeader } = await import('@/lib/pdf-header')
        const startY = await addPDFHeader(pdf, {
          title: 'KALENDER AKADEMIK',
          subtitle: `Tahun Akademik ${selectedYear.name}`
        })
        
        // Page number (top right)
        pdf.setFontSize(10)
        pdf.setTextColor(100, 100, 100)
        pdf.text(`Halaman ${page + 1} / ${totalPages}`, pageWidth - 40, startY - 5)
        
        // Create main content container
        const mainContainer = document.createElement('div')
        mainContainer.style.display = 'flex'
        mainContainer.style.gap = '15px'
        mainContainer.style.padding = '0'
        mainContainer.style.backgroundColor = '#ffffff'
        mainContainer.style.position = 'absolute'
        mainContainer.style.left = '-9999px'
        mainContainer.style.width = '1100px'
        
        // Left side: Calendar months (2 columns)
        const calendarsContainer = document.createElement('div')
        calendarsContainer.style.display = 'grid'
        calendarsContainer.style.gridTemplateColumns = 'repeat(2, 1fr)'
        calendarsContainer.style.gap = '15px'
        calendarsContainer.style.flex = '1'
        
        // Collect all events for this page with proper color mapping
        const allPageEvents: Array<{title: string, date: string, color: string, type: string}> = []
        
        pageMonths.forEach(month => {
          const clone = month.cloneNode(true) as HTMLElement
          
          // Extract events
          const eventsList = clone.querySelector('[class*="border-t"]')
          if (eventsList) {
            const eventItems = eventsList.querySelectorAll('[class*="text-xs"]')
            eventItems.forEach((item: any) => {
              const titleEl = item.querySelector('[class*="font-medium"]')
              const dateEl = item.querySelector('[class*="text-muted-foreground"]')
              const dotEl = item.querySelector('[class*="rounded-full"]')
              
              if (titleEl && dateEl) {
                // Try to get color from style first (for custom colors)
                let color = dotEl?.style?.backgroundColor
                let eventType = 'EVENT'
                
                // If no inline style, check classes (fallback)
                if (!color && dotEl && dotEl.className) {
                  if (dotEl.className.includes('bg-red')) { eventType = 'HOLIDAY'; color = '#ef4444'; }
                  else if (dotEl.className.includes('bg-orange')) { eventType = 'EXAM'; color = '#f97316'; }
                  else if (dotEl.className.includes('bg-blue')) { eventType = 'EVENT'; color = '#3b82f6'; }
                }
                
                allPageEvents.push({
                  title: titleEl.textContent || '',
                  date: dateEl.textContent || '',
                  color: color || '#3b82f6',
                  type: eventType
                })
              }
            })
            eventsList.remove()
          }
          
          // Remove borders from ALL elements
          const allElements = clone.querySelectorAll('*')
          allElements.forEach((el: any) => {
            if (el.className && typeof el.className === 'string') {
              el.className = el.className
                .split(' ')
                .filter((cls: string) => 
                  !cls.match(/^(border|ring|shadow|rounded|overflow|outline|bg-|text-)/)
                )
                .join(' ')
            }
            
            // Preserve background color for event dots if set via style
            const bgColor = el.style.backgroundColor
            
            el.removeAttribute('style')
            el.style.backgroundColor = 'transparent'
            el.style.color = '#1e293b'
            el.style.border = '0'
            el.style.borderWidth = '0'
            el.style.outline = '0'
            el.style.boxShadow = 'none'

            // Restore dot color
            if (bgColor && bgColor !== 'transparent' && bgColor !== '') {
               el.style.backgroundColor = bgColor
            }

            if (el.tagName === 'H3' || (el.className && el.className.includes('CardTitle'))) {
               el.style.color = '#0f172a'
               el.style.fontWeight = 'bold'
               el.style.textTransform = 'uppercase'
               el.style.marginBottom = '10px'
               el.style.textAlign = 'center'
               el.style.fontSize = '14px'
            }
            
            if (el.textContent && DAYS.includes(el.textContent)) {
               el.style.color = '#64748b'
               el.style.fontWeight = '600'
               el.style.fontSize = '10px'
               el.style.textAlign = 'center'
            }

            if (!isNaN(parseInt(el.textContent)) && el.childNodes.length === 1) {
               el.style.fontSize = '12px'
               el.style.fontWeight = '500'
            }
          })
          
          const cardHeader = clone.querySelector('[class*="CardHeader"]') as HTMLElement
          if (cardHeader) {
            cardHeader.style.backgroundColor = '#f1f5f9'
            cardHeader.style.padding = '10px'
            cardHeader.style.marginBottom = '10px'
            cardHeader.style.borderRadius = '4px'
            const title = cardHeader.querySelector('*') as HTMLElement
            if (title) title.style.color = '#0f172a'
          }

          clone.className = ''
          clone.removeAttribute('style')
          clone.style.backgroundColor = '#ffffff'
          clone.style.padding = '10px'
          clone.style.setProperty('border', 'none', 'important')
          clone.style.setProperty('box-shadow', 'none', 'important')
          clone.style.setProperty('outline', 'none', 'important')
          
          calendarsContainer.appendChild(clone)
        })
        
        mainContainer.appendChild(calendarsContainer)
        
        // Right side: Events panel
        const eventsPanel = document.createElement('div')
        eventsPanel.style.width = '280px'
        eventsPanel.style.backgroundColor = '#f8fafc'
        eventsPanel.style.padding = '20px'
        eventsPanel.style.borderRadius = '8px'
        eventsPanel.style.setProperty('border', 'none', 'important')
        eventsPanel.style.setProperty('box-shadow', 'none', 'important')
        
        const eventsTitle = document.createElement('div')
        eventsTitle.style.fontSize = '16px'
        eventsTitle.style.fontWeight = 'bold'
        eventsTitle.style.color = '#1e293b'
        eventsTitle.style.marginBottom = '15px'
        eventsTitle.style.paddingBottom = '10px'
        eventsTitle.style.borderBottom = '2px solid #3b82f6'
        eventsTitle.textContent = 'Agenda & Kegiatan'
        eventsPanel.appendChild(eventsTitle)
        
        if (allPageEvents.length > 0) {
          allPageEvents.forEach(event => {
            const eventItem = document.createElement('div')
            eventItem.style.marginBottom = '12px'
            eventItem.style.paddingLeft = '15px'
            eventItem.style.borderLeft = `3px solid ${event.color}`
            eventItem.style.paddingBottom = '8px'
            eventItem.style.borderTop = 'none'
            eventItem.style.borderRight = 'none'
            eventItem.style.borderBottom = 'none'
            eventItem.style.boxShadow = 'none'
            
            const eventTitle = document.createElement('div')
            eventTitle.style.fontSize = '13px'
            eventTitle.style.fontWeight = '600'
            eventTitle.style.color = '#334155'
            eventTitle.style.marginBottom = '3px'
            eventTitle.style.border = 'none'
            eventTitle.textContent = event.title
            
            const eventDate = document.createElement('div')
            eventDate.style.fontSize = '11px'
            eventDate.style.color = '#64748b'
            eventDate.style.border = 'none'
            eventDate.textContent = event.date
            
            eventItem.appendChild(eventTitle)
            eventItem.appendChild(eventDate)
            eventsPanel.appendChild(eventItem)
          })
        } else {
          const noEvents = document.createElement('div')
          noEvents.style.fontSize = '12px'
          noEvents.style.color = '#94a3b8'
          noEvents.style.fontStyle = 'italic'
          noEvents.style.textAlign = 'center'
          noEvents.style.padding = '20px 0'
          noEvents.style.border = 'none'
          noEvents.textContent = 'Tidak ada agenda'
          eventsPanel.appendChild(noEvents)
        }
        
        mainContainer.appendChild(eventsPanel)
        
        document.body.appendChild(mainContainer)
        await new Promise(resolve => setTimeout(resolve, 150))
        
        const dataUrl = await domtoimage.toPng(mainContainer, {
          quality: 1,
          bgcolor: '#ffffff',
          width: mainContainer.scrollWidth,
          height: mainContainer.scrollHeight
        })
        
        document.body.removeChild(mainContainer)
        
        const img = new Image()
        img.src = dataUrl
        await new Promise((resolve) => { img.onload = resolve })
        
        const contentWidth = pageWidth - 20
        const contentHeight = pageHeight - 40
        
        let imgWidth = contentWidth
        let imgHeight = (img.height * imgWidth) / img.width
        
        if (imgHeight > contentHeight) {
          imgHeight = contentHeight
          imgWidth = (img.width * imgHeight) / img.height
        }
        
        const xPos = (pageWidth - imgWidth) / 2
        const yPos = startY
        
        pdf.addImage(dataUrl, 'PNG', xPos, yPos, imgWidth, imgHeight)
        
        pdf.setFontSize(8)
        pdf.setTextColor(120, 120, 120)
        pdf.setFont('helvetica', 'normal')
        const footerText = `Dicetak pada ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
        pdf.text(footerText, 15, pageHeight - 5)
        pdf.text('Pondok Tadzimussunnah', pageWidth - 60, pageHeight - 5)
      }
      
      pdf.save(`kalender-${selectedYear.name.replace(/\//g, '-')}.pdf`)
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: `PDF berhasil didownload (${totalPages} halaman)`, type: 'success' } 
        }))
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: 'Gagal generate PDF: ' + (error instanceof Error ? error.message : 'Unknown error'), type: 'error' } 
        }))
      }
    } finally {
      setTheme(originalTheme as string)
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-4 relative">
      {/* Export Overlay */}
      {isExporting && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg border flex flex-col items-center gap-4 max-w-sm text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <div>
              <h3 className="font-semibold text-lg">Sedang Memproses PDF</h3>
              <p className="text-sm text-muted-foreground">
                Mohon tunggu sebentar, sistem sedang menyesuaikan tampilan untuk hasil cetak terbaik...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Year Selector and Export */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Tahun Akademik:</label>
          <Select value={selectedYearId} onValueChange={setSelectedYearId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {activeYears.map(year => (
                <SelectItem key={year.id} value={year.id}>
                  {year.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleExportPDF} variant="outline" disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Memproses...' : 'Export PDF'}
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="calendar-grid">
        {monthsToDisplay.map(({ month, year }, index) => {
          const days = generateMonth(month, year)
          
          // Get events for this month
          const monthEvents = filteredEvents.filter(event => {
            const eventStart = new Date(event.startDate)
            const eventEnd = new Date(event.endDate)
            return (
              (eventStart.getMonth() === month && eventStart.getFullYear() === year) ||
              (eventEnd.getMonth() === month && eventEnd.getFullYear() === year) ||
              (eventStart < new Date(year, month, 1) && eventEnd > new Date(year, month + 1, 0))
            )
          })
          
          return (
            <Card key={`${year}-${month}`} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-3">
                <CardTitle className="text-center text-sm font-bold uppercase">
                  {MONTH_NAMES[month]} {year}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {DAYS.map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, dayIndex) => {
                    if (day === null) {
                      return <div key={`empty-${dayIndex}`} className="aspect-square" />
                    }

                    const currentDate = new Date(year, month, day)
                    const dayEvents = getEventsForDate(currentDate)
                    const primaryEvent = dayEvents[0]
                    const colors = primaryEvent ? getEventColor(primaryEvent) : null
                    const isToday = currentDate.toDateString() === new Date().toDateString()
                    
                    return (
                      <div
                        key={day}
                        className={`
                          aspect-square flex flex-col items-center justify-between p-1 text-xs font-medium rounded relative
                          ${dayEvents.length > 0 ? 'border-2' : 'hover:bg-gray-50'}
                          ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}
                        `}
                        style={{
                          borderColor: colors ? colors.border : 'transparent'
                        }}
                        title={dayEvents.map(e => e.title).join(', ')}
                      >
                        {/* Day number */}
                        <span className={`mt-1 ${isToday ? 'font-bold text-primary' : ''}`}>
                          {day}
                        </span>

                        {/* Event Dots (Side by Side) */}
                        {dayEvents.length > 0 && (
                          <div className="flex gap-1 justify-center flex-wrap w-full mb-1 px-0.5">
                            {dayEvents.slice(0, 4).map((event, idx) => {
                              const eventColors = getEventColor(event)
                              return (
                                <div 
                                  key={idx} 
                                  className="w-2 h-2 rounded-full ring-1 ring-background" 
                                  style={{ backgroundColor: eventColors.dot }}
                                  title={event.title}
                                />
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Events for this month */}
                {monthEvents.length > 0 && (
                  <div className="mt-3 pt-3 border-t space-y-1 max-h-32 overflow-y-auto">
                    {monthEvents.map(event => {
                      const colors = getEventColor(event)
                      return (
                        <div key={event.id} className="text-xs flex items-start gap-1.5">
                          <div 
                            className="w-2 h-2 rounded-full mt-0.5 flex-shrink-0" 
                            style={{ backgroundColor: colors.dot }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{event.title}</p>
                            <p className="text-muted-foreground text-[10px]">
                              {new Date(event.startDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })} - 
                              {new Date(event.endDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Event Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Keterangan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-sm">Libur</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500" />
              <span className="text-sm">Ujian</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span className="text-sm">Kegiatan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded ring-2 ring-primary" />
              <span className="text-sm">Hari Ini</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
