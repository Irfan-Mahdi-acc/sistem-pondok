'use client'

import { useState, useMemo, useRef, useEffect } from "react"
import { X, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface MultiLembagaSelectorProps {
  lembagaList: Array<{ id: string; name: string; tags?: string }>
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function MultiLembagaSelector({ lembagaList, selectedIds, onChange }: MultiLembagaSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')
  const buttonRef = useRef<HTMLDivElement>(null)

  const selectedLembagas = lembagaList.filter(l => selectedIds.includes(l.id))
  
  // Group lembaga by tags
  const lembagaByTag = useMemo(() => {
    const groups: { [key: string]: typeof lembagaList } = {}
    lembagaList.forEach(lembaga => {
      if (lembaga.tags) {
        const tags = lembaga.tags.split(',').map(t => t.trim())
        tags.forEach(tag => {
          if (!groups[tag]) groups[tag] = []
          groups[tag].push(lembaga)
        })
      }
    })
    return groups
  }, [lembagaList])

  const availableLembagas = lembagaList.filter(l => 
    !selectedIds.includes(l.id) && 
    l.name.toLowerCase().includes(search.toLowerCase())
  )

  // Check space and adjust dropdown position
  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      const dropdownHeight = 400 // estimated max height
      
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition('top')
      } else {
        setDropdownPosition('bottom')
      }
    }
  }, [open])

  const handleSelect = (id: string) => {
    onChange([...selectedIds, id])
    setSearch("")
  }

  const handleSelectAll = () => {
    onChange(lembagaList.map(l => l.id))
    setOpen(false)
  }

  const handleSelectByTag = (tag: string) => {
    const tagLembagaIds = lembagaByTag[tag].map(l => l.id)
    const newSelected = [...new Set([...selectedIds, ...tagLembagaIds])]
    onChange(newSelected)
    setOpen(false)
  }

  const handleRemove = (id: string) => {
    onChange(selectedIds.filter(selectedId => selectedId !== id))
  }

  const allSelected = selectedIds.length === lembagaList.length

  return (
    <div className="space-y-2">
      {/* Selected Tags Container */}
      <div className="min-h-[42px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
        <div className="flex flex-wrap gap-2">
          {selectedLembagas.map(lembaga => (
            <Badge 
              key={lembaga.id} 
              variant="secondary"
              className="pl-3 pr-1 py-1 gap-1 text-sm"
            >
              {lembaga.name}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemove(lembaga.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {/* Add Button */}
          <div className="relative" ref={buttonRef}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 border-dashed"
              onClick={() => setOpen(!open)}
            >
              + Tambah Lembaga
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
            
            {/* Dropdown - auto flip position */}
            {open && (
              <div 
                className={`absolute left-0 mt-1 w-[320px] rounded-md border bg-popover shadow-md z-50 ${
                  dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full'
                }`}
              >
                {/* Search */}
                <div className="p-2 border-b">
                  <Input
                    placeholder="Cari lembaga..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8"
                    autoFocus
                  />
                </div>

                {/* Quick Actions */}
                {!search && (
                  <div className="p-2 border-b space-y-1">
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-accent rounded-sm cursor-pointer bg-primary/10"
                      onClick={handleSelectAll}
                      disabled={allSelected}
                    >
                      ✓ Semua Lembaga ({lembagaList.length})
                    </button>
                    
                    {Object.keys(lembagaByTag).length > 0 && (
                      <>
                        <div className="px-3 py-1 text-xs font-semibold text-muted-foreground">
                          Pilih berdasarkan tag:
                        </div>
                        {Object.entries(lembagaByTag).map(([tag, lembagas]) => (
                          <button
                            key={tag}
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-sm cursor-pointer"
                            onClick={() => handleSelectByTag(tag)}
                          >
                            <Badge variant="outline" className="mr-2 text-xs">
                              {tag}
                            </Badge>
                            ({lembagas.length} lembaga)
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {/* Lembaga List */}
                <div className="max-h-64 overflow-auto p-2">
                  {availableLembagas.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {search ? 'Tidak ditemukan' : 'Semua lembaga sudah dipilih'}
                    </p>
                  ) : (
                    <>
                      {!search && (
                        <div className="px-3 py-1 text-xs font-semibold text-muted-foreground">
                          Pilih individual:
                        </div>
                      )}
                      {availableLembagas.map(lembaga => (
                        <button
                          key={lembaga.id}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-sm cursor-pointer"
                          onClick={() => handleSelect(lembaga.id)}
                        >
                          {lembaga.name}
                          {lembaga.tags && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({lembaga.tags})
                            </span>
                          )}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Click outside to close */}
      {open && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setOpen(false)}
        />
      )}
      
      {selectedIds.length === 0 && (
        <p className="text-xs text-destructive">Pilih minimal 1 lembaga</p>
      )}
      
      {selectedIds.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedIds.length} lembaga dipilih
          {allSelected && ' (Semua)'}
        </p>
      )}
    </div>
  )
}
