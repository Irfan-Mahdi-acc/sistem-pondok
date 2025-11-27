'use client'

import { useState, useMemo } from 'react'
import LembagaTable from "./lembaga-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

type LembagaFilterWrapperProps = {
  lembagas: any[]
  availableTags: string[]
}

export function LembagaFilterWrapper({ lembagas, availableTags }: LembagaFilterWrapperProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const filteredLembagas = useMemo(() => {
    if (!selectedTag) return lembagas

    return lembagas.filter(lembaga => {
      if (!lembaga.tags) return false
      const tags = lembaga.tags.split(',').map((t: string) => t.trim())
      return tags.includes(selectedTag)
    })
  }, [lembagas, selectedTag])

  return (
    <div className="space-y-4">
      {/* Tag Filter */}
      {availableTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filter by Tag:</span>
            {selectedTag && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTag(null)}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Count */}
      <div className="text-sm text-muted-foreground">
        Menampilkan {filteredLembagas.length} dari {lembagas.length} lembaga
        {selectedTag && ` dengan tag "${selectedTag}"`}
      </div>

      {/* Table */}
      <LembagaTable lembagas={filteredLembagas} />
    </div>
  )
}
