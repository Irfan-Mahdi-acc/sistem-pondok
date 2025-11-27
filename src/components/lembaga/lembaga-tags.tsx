'use client'

import { Badge } from "@/components/ui/badge"

type LembagaTagsProps = {
  tags: string | null
  onTagClick?: (tag: string) => void
}

export function LembagaTags({ tags, onTagClick }: LembagaTagsProps) {
  if (!tags || tags.trim() === '') {
    return null
  }

  const tagArray = tags.split(',').map(t => t.trim()).filter(t => t !== '')

  if (tagArray.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tagArray.map((tag, index) => (
        <Badge
          key={index}
          variant="secondary"
          className={onTagClick ? "cursor-pointer hover:bg-secondary/80" : ""}
          onClick={() => onTagClick?.(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  )
}
